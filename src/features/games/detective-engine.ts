import {
  answerFor,
  equipmentCards,
  equipmentById,
  questionById,
} from "./detective-data.ts";
export type DetectiveSettings = {
  mode: "solo" | "teams";
  names: [string, string];
  winsTo: 1 | 2 | 3;
  guided: boolean;
};
export type QuestionLog = {
  questionId: string;
  answer: boolean;
  before: number;
  after: number;
};
export type DetectiveStage =
  | "pick"
  | "pick-handoff"
  | "ready"
  | "board"
  | "answer"
  | "wrong"
  | "result"
  | "finished";
export type DetectiveGame = {
  version: 1;
  settings: DetectiveSettings;
  stage: DetectiveStage;
  selecting: 0 | 1;
  secrets: [string | null, string | null];
  active: 0 | 1;
  starter: 0 | 1;
  round: number;
  scores: [number, number];
  candidates: [string[], string[]];
  logs: [QuestionLog[], QuestionLog[]];
  wrongs: [number, number];
  hints: [number, number];
  undo: [string[][], string[][]];
  pending: QuestionLog | null;
  lastGuess: string | null;
  winner: 0 | 1 | null;
  reason: "correct" | "attempts" | null;
  resumeStage?: "board" | "answer" | "wrong";
};
export const DETECTIVE_KEY = "ftr-atlas-fizyo-dedektif-v1";
const allIds = () => equipmentCards.map((c) => c.id);
const randomCard = (random: () => number) =>
  allIds()[Math.floor(random() * equipmentCards.length)];
export function createDetective(
  settings: DetectiveSettings,
  random = Math.random,
): DetectiveGame {
  const starter: 0 | 1 = settings.mode === "solo" ? 0 : random() < 0.5 ? 0 : 1;
  return {
    version: 1,
    settings,
    stage: settings.mode === "solo" ? "ready" : "pick",
    selecting: 0,
    secrets: [null, settings.mode === "solo" ? randomCard(random) : null],
    active: starter,
    starter,
    round: 1,
    scores: [0, 0],
    candidates: [allIds(), allIds()],
    logs: [[], []],
    wrongs: [0, 0],
    hints: [0, 0],
    undo: [[], []],
    pending: null,
    lastGuess: null,
    winner: null,
    reason: null,
  };
}
export const targetId = (g: DetectiveGame) => g.secrets[g.active === 0 ? 1 : 0];
function conclude(
  g: DetectiveGame,
  winner: 0 | 1 | null,
  reason: "correct" | "attempts",
): DetectiveGame {
  const scores: [number, number] = [...g.scores];
  if (winner !== null) scores[winner]++;
  return {
    ...g,
    winner,
    reason,
    scores,
    stage:
      g.settings.mode === "solo" || scores.some((n) => n >= g.settings.winsTo)
        ? "finished"
        : "result",
  };
}
function handoff(g: DetectiveGame): DetectiveGame {
  return {
    ...g,
    stage: g.settings.mode === "solo" ? "board" : "ready",
    active: g.settings.mode === "solo" ? 0 : g.active === 0 ? 1 : 0,
    pending: null,
    lastGuess: null,
  };
}
export type DetectiveAction =
  | { type: "pick"; id: string }
  | { type: "pick-ready" }
  | { type: "start" }
  | { type: "ask"; id: string }
  | { type: "acknowledge" }
  | { type: "toggle"; id: string }
  | { type: "undo" }
  | { type: "hint" }
  | { type: "guess"; id: string }
  | { type: "skip" }
  | { type: "next-round" };
export function detectiveTransition(
  g: DetectiveGame,
  a: DetectiveAction,
): DetectiveGame {
  if (a.type === "pick" && g.stage === "pick" && equipmentById.has(a.id)) {
    const secrets: [string | null, string | null] = [...g.secrets];
    secrets[g.selecting] = a.id;
    return {
      ...g,
      secrets,
      stage: g.selecting === 0 ? "pick-handoff" : "ready",
    };
  }
  if (a.type === "pick-ready" && g.stage === "pick-handoff")
    return { ...g, selecting: 1, stage: "pick" };
  if (a.type === "start" && g.stage === "ready" && targetId(g))
    return { ...g, stage: g.resumeStage ?? "board", resumeStage: undefined };
  if (a.type === "next-round" && g.stage === "result") {
    const fresh = createDetective(g.settings);
    const starter: 0 | 1 = g.starter === 0 ? 1 : 0;
    return {
      ...fresh,
      round: g.round + 1,
      scores: [...g.scores],
      starter,
      active: starter,
    };
  }
  if (a.type === "acknowledge" && (g.stage === "answer" || g.stage === "wrong"))
    return handoff(g);
  if (g.stage !== "board") return g;
  const team = g.active;
  if (a.type === "skip") return g.settings.mode === "teams" ? handoff(g) : g;
  if (
    a.type === "ask" &&
    questionById.has(a.id) &&
    !g.logs[team].some((l) => l.questionId === a.id)
  ) {
    const target = targetId(g);
    if (!target) return g;
    const answer = answerFor(target, a.id),
      before = g.candidates[team].length;
    const candidates: [string[], string[]] = [
      [...g.candidates[0]],
      [...g.candidates[1]],
    ];
    const undo: [string[][], string[][]] = [[...g.undo[0]], [...g.undo[1]]];
    if (g.settings.guided) {
      undo[team] = [...undo[team].slice(-63), [...candidates[team]]];
      candidates[team] = candidates[team].filter(
        (id) => answerFor(id, a.id) === answer,
      );
    }
    const pending = {
      questionId: a.id,
      answer,
      before,
      after: candidates[team].length,
    };
    const logs: [QuestionLog[], QuestionLog[]] = [
      [...g.logs[0]],
      [...g.logs[1]],
    ];
    logs[team].push(pending);
    return { ...g, candidates, logs, undo, pending, stage: "answer" };
  }
  if (a.type === "toggle" && equipmentById.has(a.id)) {
    const candidates: [string[], string[]] = [
      [...g.candidates[0]],
      [...g.candidates[1]],
    ];
    const undo: [string[][], string[][]] = [[...g.undo[0]], [...g.undo[1]]];
    undo[team] = [...undo[team].slice(-63), [...candidates[team]]];
    candidates[team] = candidates[team].includes(a.id)
      ? candidates[team].filter((id) => id !== a.id)
      : [...candidates[team], a.id];
    return { ...g, candidates, undo };
  }
  if (a.type === "undo" && g.undo[team].length) {
    const candidates: [string[], string[]] = [
      [...g.candidates[0]],
      [...g.candidates[1]],
    ];
    const undo: [string[][], string[][]] = [[...g.undo[0]], [...g.undo[1]]];
    candidates[team] = undo[team].pop()!;
    return { ...g, candidates, undo };
  }
  if (a.type === "hint") {
    const hints: [number, number] = [...g.hints];
    hints[team]++;
    return { ...g, hints };
  }
  if (a.type === "guess" && g.candidates[team].includes(a.id)) {
    const last = { ...g, lastGuess: a.id };
    if (a.id === targetId(g)) return conclude(last, team, "correct");
    const wrongs: [number, number] = [...g.wrongs];
    wrongs[team]++;
    const candidates: [string[], string[]] = [
      [...g.candidates[0]],
      [...g.candidates[1]],
    ];
    candidates[team] = candidates[team].filter((id) => id !== a.id);
    const next = { ...last, wrongs, candidates };
    return wrongs[team] >= 3
      ? conclude(
          next,
          g.settings.mode === "solo" ? null : team === 0 ? 1 : 0,
          "attempts",
        )
      : { ...next, stage: "wrong" };
  }
  return g;
}
export function restoreDetective(raw: string | null): DetectiveGame | null {
  try {
    if (!raw) return null;
    const g = JSON.parse(raw) as DetectiveGame;
    if (
      !g ||
      g.version !== 1 ||
      !g.settings ||
      !["solo", "teams"].includes(g.settings.mode) ||
      ![1, 2, 3].includes(g.settings.winsTo) ||
      typeof g.settings.guided !== "boolean"
    )
      return null;
    if (
      !Array.isArray(g.settings.names) ||
      g.settings.names.length !== 2 ||
      !g.settings.names.every(
        (n) => typeof n === "string" && n.trim().length > 0 && n.length <= 30,
      )
    )
      return null;
    if (
      ![
        "pick",
        "pick-handoff",
        "ready",
        "board",
        "answer",
        "wrong",
        "result",
        "finished",
      ].includes(g.stage) ||
      ![0, 1].includes(g.active) ||
      ![0, 1].includes(g.selecting) ||
      ![0, 1].includes(g.starter) ||
      !Number.isInteger(g.round) ||
      g.round < 1 ||
      g.round > 5
    )
      return null;
    const validIds = (arr: unknown): arr is string[] =>
      Array.isArray(arr) &&
      arr.length <= 16 &&
      new Set(arr).size === arr.length &&
      arr.every((id) => equipmentById.has(id));
    if (
      !Array.isArray(g.secrets) ||
      g.secrets.length !== 2 ||
      !g.secrets.every((id) => id === null || equipmentById.has(id))
    )
      return null;
    if (
      !Array.isArray(g.candidates) ||
      g.candidates.length !== 2 ||
      !g.candidates.every(validIds)
    )
      return null;
    for (const arr of [g.scores, g.wrongs, g.hints])
      if (
        !Array.isArray(arr) ||
        arr.length !== 2 ||
        !arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 1000)
      )
        return null;
    if (g.wrongs.some((n) => n > 3) || g.scores.some((n) => n > 3)) return null;
    if (
      !Array.isArray(g.logs) ||
      g.logs.length !== 2 ||
      !g.logs.every(
        (arr) =>
          Array.isArray(arr) &&
          arr.length <= 24 &&
          new Set(arr.map((l) => l.questionId)).size === arr.length &&
          arr.every(
            (l) =>
              questionById.has(l.questionId) &&
              typeof l.answer === "boolean" &&
              Number.isInteger(l.before) &&
              Number.isInteger(l.after),
          ),
      )
    )
      return null;
    if (
      !Array.isArray(g.undo) ||
      g.undo.length !== 2 ||
      !g.undo.every(
        (arr) => Array.isArray(arr) && arr.length <= 64 && arr.every(validIds),
      )
    )
      return null;
    if (
      g.pending !== null &&
      (!g.pending ||
        !questionById.has(g.pending.questionId) ||
        typeof g.pending.answer !== "boolean")
    )
      return null;
    if (g.lastGuess !== null && !equipmentById.has(g.lastGuess)) return null;
    if (g.winner !== null && g.winner !== 0 && g.winner !== 1) return null;
    if (g.reason !== null && g.reason !== "correct" && g.reason !== "attempts")
      return null;
    if (
      g.resumeStage !== undefined &&
      !["board", "answer", "wrong"].includes(g.resumeStage)
    )
      return null;
    if (!["pick", "pick-handoff"].includes(g.stage) && !targetId(g))
      return null;
    if (g.stage === "answer" && !g.pending) return null;
    if (g.stage === "wrong" && !g.lastGuess) return null;
    if (g.stage === "board" || g.stage === "answer" || g.stage === "wrong")
      return { ...g, resumeStage: g.stage, stage: "ready" };
    return g;
  } catch {
    return null;
  }
}
