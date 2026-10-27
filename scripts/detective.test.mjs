import { test } from "node:test";
import assert from "node:assert/strict";
import {
  equipmentCards,
  detectiveQuestions,
  answerFor,
  bestQuestion,
} from "../src/features/games/detective-data.ts";
import {
  createDetective,
  detectiveTransition as step,
  restoreDetective,
  targetId,
} from "../src/features/games/detective-engine.ts";
const solo = {
  mode: "solo",
  names: ["Dedektif", "Kart"],
  winsTo: 1,
  guided: true,
};
const teams = {
  mode: "teams",
  names: ["Mavi", "Yeşil"],
  winsTo: 2,
  guided: true,
};
function teamGame() {
  let g = createDetective(teams, () => 0);
  g = step(g, { type: "pick", id: "ball" });
  g = step(g, { type: "pick-ready" });
  g = step(g, { type: "pick", id: "walker" });
  return step(g, { type: "start" });
}
function single() {
  return step(
    createDetective(solo, () => 0),
    { type: "start" },
  );
}
test("16 distinct illustrated items, 24 valid questions and unique answer fingerprints", () => {
  assert.equal(equipmentCards.length, 16);
  assert.equal(detectiveQuestions.length, 24);
  assert.equal(new Set(equipmentCards.map((c) => c.id)).size, 16);
  assert.equal(new Set(equipmentCards.map((c) => c.name)).size, 16);
  assert.equal(new Set(detectiveQuestions.map((q) => q.id)).size, 24);
  for (const c of equipmentCards)
    for (const f of c.features)
      assert.ok(detectiveQuestions.some((q) => q.id === f));
  assert.equal(
    new Set(
      equipmentCards.map((c) =>
        detectiveQuestions.map((q) => answerFor(c.id, q.id)).join(","),
      ),
    ).size,
    16,
  );
});
test("every secret can be identified with balanced questions without leaking its identity", () => {
  for (const card of equipmentCards) {
    let candidates = equipmentCards.map((c) => c.id),
      asked = [];
    while (candidates.length > 1) {
      const q = bestQuestion(candidates, asked);
      assert.ok(q, card.name);
      asked.push(q.id);
      const answer = answerFor(card.id, q.id);
      candidates = candidates.filter((id) => answerFor(id, q.id) === answer);
      assert.ok(candidates.includes(card.id));
      assert.ok(asked.length <= 8);
    }
    assert.equal(candidates[0], card.id);
  }
});
test("solo secret is generated once; guided answer leaves only matching candidates", () => {
  let g = single();
  assert.equal(targetId(g), "dumbbells");
  g = step(g, { type: "ask", id: "exercise" });
  assert.equal(g.stage, "answer");
  assert.equal(g.pending.answer, true);
  assert.equal(g.candidates[0].length, 8);
  assert.equal(g.logs[0].length, 1);
  assert.ok(g.candidates[0].includes("dumbbells"));
  assert.equal(step(g, { type: "ask", id: "screen" }), g);
  g = step(g, { type: "acknowledge" });
  assert.equal(g.stage, "board");
  assert.equal(step(g, { type: "ask", id: "exercise" }), g);
});
test("manual answers log evidence without changing candidates", () => {
  let g = step(
    createDetective({ ...solo, guided: false }, () => 0),
    { type: "start" },
  );
  g = step(g, { type: "ask", id: "screen" });
  assert.equal(g.pending.answer, false);
  assert.equal(g.candidates[0].length, 16);
  assert.equal(g.logs[0].length, 1);
});
test("teams choose private cards, inspect opponents target, and transfer after one question", () => {
  let g = createDetective(teams, () => 0);
  assert.equal(g.stage, "pick");
  g = step(g, { type: "pick", id: "ball" });
  assert.equal(g.stage, "pick-handoff");
  assert.equal(g.secrets[1], null);
  assert.equal(step(g, { type: "pick", id: "cane" }), g);
  g = step(g, { type: "pick-ready" });
  assert.equal(g.selecting, 1);
  g = step(g, { type: "pick", id: "walker" });
  assert.equal(g.stage, "ready");
  assert.equal(targetId(g), "walker");
  g = step(g, { type: "start" });
  g = step(g, { type: "ask", id: "walking" });
  assert.equal(g.pending.answer, true);
  g = step(g, { type: "acknowledge" });
  assert.equal(g.stage, "ready");
  assert.equal(g.active, 1);
  assert.equal(targetId(g), "ball");
  assert.equal(g.logs[0].length, 1);
  assert.equal(g.logs[1].length, 0);
});
test("elimination and undo are per team and do not rewind question history", () => {
  let g = single();
  g = step(g, { type: "toggle", id: "ball" });
  assert.equal(g.candidates[0].length, 15);
  g = step(g, { type: "undo" });
  assert.equal(g.candidates[0].length, 16);
  g = step(g, { type: "ask", id: "exercise" });
  g = step(g, { type: "acknowledge" });
  g = step(g, { type: "undo" });
  assert.equal(g.candidates[0].length, 16);
  assert.equal(g.logs[0].length, 1);
  const h = teamGame(),
    next = step(h, { type: "toggle", id: "cane" });
  assert.equal(next.candidates[1].length, 16);
});
test("correct guess wins an individual hand; starter alternates on next hand", () => {
  let g = teamGame();
  const first = g.starter;
  g = step(g, { type: "guess", id: "walker" });
  assert.equal(g.stage, "result");
  assert.equal(g.winner, 0);
  assert.deepEqual(g.scores, [1, 0]);
  assert.equal(step(g, { type: "guess", id: "walker" }), g);
  g = step(g, { type: "next-round" });
  assert.equal(g.round, 2);
  assert.equal(g.starter, first === 0 ? 1 : 0);
  assert.deepEqual(g.secrets, [null, null]);
  assert.equal(g.stage, "pick");
});
test("three wrong solo guesses finish the game, wrong cards cannot be guessed again while eliminated", () => {
  let g = single();
  for (const id of ["ball", "walker", "cane"]) {
    g = step(g, { type: "guess", id });
    if (g.stage === "wrong") g = step(g, { type: "acknowledge" });
  }
  assert.equal(g.stage, "finished");
  assert.equal(g.winner, null);
  assert.equal(g.reason, "attempts");
  assert.equal(g.wrongs[0], 3);
});
test("wrong team guess changes turn; three wrong guesses award the opponent the hand", () => {
  let g = teamGame();
  for (const id of ["band", "mat", "bike"]) {
    g = step(g, { type: "guess", id });
    if (g.stage === "wrong") {
      g = step(g, { type: "acknowledge" });
      assert.equal(g.active, 1);
      g = step(g, { type: "start" });
      g = step(g, { type: "skip" });
      g = step(g, { type: "start" });
    }
  }
  assert.equal(g.stage, "result");
  assert.equal(g.winner, 1);
  assert.deepEqual(g.scores, [0, 1]);
});
test("first to the selected number of wins finishes the match", () => {
  let g = teamGame();
  g = step(g, { type: "guess", id: "walker" });
  g = step(g, { type: "next-round" });
  g = step(g, { type: "pick", id: "ball" });
  g = step(g, { type: "pick-ready" });
  g = step(g, { type: "pick", id: "walker" });
  g = step(g, { type: "start" });
  assert.equal(g.active, 1);
  g = step(g, { type: "skip" });
  g = step(g, { type: "start" });
  g = step(g, { type: "guess", id: "walker" });
  assert.equal(g.stage, "finished");
  assert.equal(g.winner, 0);
  assert.deepEqual(g.scores, [2, 0]);
});
test("restored active games first show a hidden handoff gate and preserve pending answer", () => {
  let g = single();
  let saved = restoreDetective(JSON.stringify(g));
  assert.equal(saved.stage, "ready");
  assert.equal(saved.resumeStage, "board");
  g = step(g, { type: "ask", id: "exercise" });
  saved = restoreDetective(JSON.stringify(g));
  assert.equal(saved.stage, "ready");
  saved = step(saved, { type: "start" });
  assert.equal(saved.stage, "answer");
  assert.equal(saved.pending.answer, true);
  assert.equal(restoreDetective("broken"), null);
  assert.equal(restoreDetective("{}"), null);
  const broken = { ...g, candidates: [["unknown"], []] };
  assert.equal(restoreDetective(JSON.stringify(broken)), null);
});
test("hint recommendation uses only candidates and asked questions", () => {
  const a = single(),
    b = step(
      createDetective(solo, () => 0.9),
      { type: "start" },
    );
  assert.equal(
    bestQuestion(a.candidates[0], []).id,
    bestQuestion(b.candidates[0], []).id,
  );
  const next = step(a, { type: "hint" });
  assert.equal(next.hints[0], 1);
  assert.deepEqual(next.candidates, a.candidates);
  assert.deepEqual(next.secrets, a.secrets);
});
test("invalid actions cannot change hidden selection, pending answer or finished state", () => {
  const g = single();
  assert.equal(step(g, { type: "pick", id: "ball" }), g);
  assert.equal(step(g, { type: "guess", id: "unknown" }), g);
  assert.equal(step(g, { type: "ask", id: "unknown" }), g);
  const won = step(g, { type: "guess", id: "dumbbells" });
  assert.equal(won.stage, "finished");
  assert.equal(step(won, { type: "toggle", id: "ball" }), won);
});
