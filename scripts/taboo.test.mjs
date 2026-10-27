import { test } from "node:test";
import assert from "node:assert/strict";
import { tabooCards } from "../src/features/games/cards.ts";
import {
  createGame,
  transition,
  restoreGame,
  shuffle,
  activeTeam,
  passCount,
} from "../src/features/games/engine.ts";
const settings = {
  teams: ["Mavi", "Yeşil"],
  seconds: 60,
  rounds: 1,
  passes: 1,
  difficulty: "Tümü",
  category: "Tümü",
  sound: false,
};
const pool = tabooCards.map((c) => c.id);
const start = () =>
  transition(createGame(settings, pool), { type: "start", now: 1000 });
const mark = (g, outcome, now = 2000) =>
  transition(g, {
    type: "mark",
    now,
    cardId: g.deck[g.cursor],
    cursor: g.cursor,
    cycle: g.cycle,
    outcome,
  });
test("45 unique cards, five nonempty prohibitions each, correct Turkish terms", () => {
  assert.equal(tabooCards.length, 45);
  assert.equal(new Set(pool).size, 45);
  assert.equal(new Set(tabooCards.map((c) => c.word)).size, 45);
  for (const c of tabooCards) {
    assert.equal(c.forbidden.length, 5);
    assert.ok(c.forbidden.every((w) => w.trim()));
    assert.equal(new Set(c.forbidden).size, 5);
  }
  assert.ok(tabooCards.some((c) => c.word === "Artırılmış gerçeklik"));
  assert.ok(tabooCards.some((c) => c.word === "Çevrim içi toplantı"));
  assert.ok(
    !JSON.stringify(tabooCards).match(
      /GMAİL|STREAMİNG|ARTTIRILMIŞ|ÇEVRİMİÇİ|SPOTİFY|PLAYSTATİON/,
    ),
  );
});
test("shuffle preserves input, IDs and no repeats before exhaustion", () => {
  const original = [...pool];
  assert.deepEqual(pool, original);
  assert.deepEqual(
    [...shuffle(pool)].sort((a, b) => a - b),
    pool,
  );
  let g = start();
  const seen = [];
  for (let i = 0; i < 45; i++) {
    seen.push(g.deck[g.cursor]);
    g = mark(g, "correct");
  }
  assert.equal(new Set(seen).size, 45);
  assert.equal(g.deck.length, 90);
  assert.equal(g.plays.length, 45);
});
test("scoring, pass limit and undo preserve elapsed time", () => {
  let g = start();
  g = mark(g, "correct");
  g = mark(g, "taboo");
  g = mark(g, "pass");
  assert.equal(passCount(g), 1);
  const before = g;
  g = mark(g, "pass");
  assert.equal(g, before);
  g = transition(g, { type: "undo", now: 2500 });
  assert.equal(passCount(g), 0);
  assert.equal(g.deadline, 61000);
  g = mark(g, "correct");
  g = transition(g, { type: "tick", now: 61000 });
  assert.equal(g.scores[0], 1);
  assert.equal(g.history.length, 1);
  assert.equal(transition(g, { type: "tick", now: 62000 }).history.length, 1);
});
test("stale duplicate actions cannot score a second card", () => {
  const g = start(),
    action = {
      type: "mark",
      outcome: "correct",
      now: 2000,
      cardId: g.deck[g.cursor],
      cursor: g.cursor,
      cycle: g.cycle,
    };
  const next = transition(g, action);
  assert.equal(transition(next, action).plays.length, 1);
});
test("expired timer rejects late score and timer uses actual wall time", () => {
  let g = start();
  g = mark(g, "correct", 61000);
  assert.equal(g.stage, "summary");
  assert.equal(g.scores[0], 0);
  let delayed = transition(start(), { type: "tick", now: 70000 });
  assert.equal(delayed.stage, "summary");
});
test("pause hides running state, preserves remaining duration and resumes correctly", () => {
  let g = transition(start(), { type: "pause", now: 16000 });
  assert.equal(g.remaining, 45000);
  assert.equal(g.stage, "paused");
  assert.equal(mark(g, "correct", 17000), g);
  g = transition(g, { type: "resume", now: 100000 });
  assert.equal(g.deadline, 145000);
  g = transition(g, { type: "tick", now: 145000 });
  assert.equal(g.stage, "summary");
});
test("both teams receive equal rounds, scores finalize once", () => {
  let g = mark(start(), "correct");
  g = transition(g, { type: "tick", now: 61000 });
  g = transition(g, { type: "next" });
  assert.equal(g.stage, "ready");
  assert.equal(activeTeam(g), 1);
  g = transition(g, { type: "start", now: 70000 });
  g = mark(g, "correct", 71000);
  g = mark(g, "correct", 72000);
  g = transition(g, { type: "tick", now: 130000 });
  g = transition(g, { type: "next" });
  assert.equal(g.stage, "finished");
  assert.deepEqual(g.scores, [1, 2]);
  assert.equal(g.history.length, 2);
});
test("storage restores a running game paused and rejects corrupted saves", () => {
  assert.equal(restoreGame(JSON.stringify(start()), pool)?.stage, "paused");
  assert.equal(restoreGame("broken", pool), null);
  assert.equal(restoreGame("{}", pool), null);
  const g = start();
  g.deck = [999];
  assert.equal(restoreGame(JSON.stringify(g), pool), null);
  const h = start();
  h.settings.teams = ["", "B"];
  assert.equal(restoreGame(JSON.stringify(h), pool), null);
});
test("undo works across a deck reshuffle boundary", () => {
  let g = start();
  for (let i = 0; i < 45; i++) g = mark(g, "correct");
  const previous = g.deck[44];
  g = transition(g, { type: "undo", now: 3000 });
  assert.equal(g.deck[g.cursor], previous);
  assert.equal(g.plays.length, 44);
});

test('a timed-out visible card never carries into the next team turn',()=>{
  let g=start();const expiredCard=g.deck[g.cursor];
  g=transition(g,{type:'tick',now:61000});
  g=transition(g,{type:'next'});
  assert.notEqual(g.deck[g.cursor],expiredCard);
  assert.equal(g.plays.length,0);
});
