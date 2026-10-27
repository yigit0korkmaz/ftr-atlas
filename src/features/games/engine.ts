export type Outcome = "correct" | "taboo" | "pass";
export type Settings = {
  teams: [string, string];
  seconds: number;
  rounds: number;
  passes: number;
  difficulty: string;
  category: string;
  sound: boolean;
};
export type Play = { cardId: number; outcome: Outcome };
export type Turn = { team: 0 | 1; plays: Play[]; score: number };
export type Game = {
  settings: Settings;
  pool: number[];
  deck: number[];
  cursor: number;
  cycle: number;
  turn: number;
  history: Turn[];
  plays: Play[];
  scores: [number, number];
  stage: "ready" | "playing" | "paused" | "summary" | "finished";
  remaining: number;
  deadline: number;
};
export const STORAGE_KEY = "ftr-atlas-physiotech-tabu-v1";
export const points = (outcome: Outcome) =>
  outcome === "correct" ? 1 : outcome === "taboo" ? -1 : 0;
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createGame(settings: Settings, pool: number[]): Game {
  if (pool.length < 5) throw new Error("En az 5 kart gerekli.");
  return {
    settings,
    pool,
    deck: shuffle(pool),
    cursor: 0,
    cycle: 1,
    turn: 0,
    history: [],
    plays: [],
    scores: [0, 0],
    stage: "ready",
    remaining: settings.seconds * 1000,
    deadline: 0,
  };
}
export const activeTeam = (g: Game): 0 | 1 => (g.turn % 2) as 0 | 1;
export const passCount = (g: Game) =>
  g.plays.filter((p) => p.outcome === "pass").length;
function advanceCard(g: Game): Game {
  const next = { ...g, cursor: g.cursor + 1 };
  if (next.cursor >= next.deck.length) {
    next.deck = [...next.deck, ...shuffle(next.pool)];
    next.cycle++;
  }
  return next;
}
export function endTurn(g: Game): Game {
  const score = g.plays.reduce((sum, p) => sum + points(p.outcome), 0);
  const team = activeTeam(g),
    scores: [number, number] = [...g.scores];
  scores[team] += score;
  return {
    ...advanceCard(g),
    scores,
    history: [...g.history, { team, plays: [...g.plays], score }],
    stage: "summary",
    deadline: 0,
    remaining: 0,
  };
}
export type Action =
  | { type: "start"; now: number }
  | { type: "tick"; now: number }
  | { type: "pause"; now: number }
  | { type: "resume"; now: number }
  | {
      type: "mark";
      now: number;
      cardId: number;
      cursor: number;
      cycle: number;
      outcome: Outcome;
    }
  | { type: "undo"; now: number }
  | { type: "next" };
export function transition(g: Game, action: Action): Game {
  if (action.type === "start" && g.stage === "ready")
    return { ...g, stage: "playing", deadline: action.now + g.remaining };
  if (action.type === "resume" && g.stage === "paused")
    return { ...g, stage: "playing", deadline: action.now + g.remaining };
  if (action.type === "next" && g.stage === "summary")
    return g.turn + 1 >= g.settings.rounds * 2
      ? { ...g, stage: "finished" }
      : {
          ...g,
          turn: g.turn + 1,
          plays: [],
          stage: "ready",
          remaining: g.settings.seconds * 1000,
        };
  if (g.stage !== "playing" && action.type !== "undo") return g;
  if ("now" in action && g.stage === "playing" && action.now >= g.deadline)
    return endTurn(g);
  if (action.type === "tick" && g.stage === "playing")
    return { ...g, remaining: Math.max(0, g.deadline - action.now) };
  if (action.type === "pause" && g.stage === "playing")
    return {
      ...g,
      remaining: Math.max(0, g.deadline - action.now),
      deadline: 0,
      stage: "paused",
    };
  if (action.type === "mark") {
    if (
      action.cardId !== g.deck[g.cursor] ||
      action.cursor !== g.cursor ||
      action.cycle !== g.cycle
    )
      return g;
    if (action.outcome === "pass" && passCount(g) >= g.settings.passes)
      return g;
    const result = {
      ...g,
      plays: [...g.plays, { cardId: action.cardId, outcome: action.outcome }],
    };
    return advanceCard(result);
  }
  if (
    action.type === "undo" &&
    (g.stage === "playing" || g.stage === "paused") &&
    g.plays.length
  )
    return {
      ...g,
      plays: g.plays.slice(0, -1),
      cursor: Math.max(0, g.cursor - 1),
    };
  return g;
}
export function restoreGame(
  raw: string | null,
  allowedIds: number[],
): Game | null {
  try {
    if (!raw) return null;
    const g = JSON.parse(raw) as Game;
    const ids = new Set(allowedIds);
    if (
      !g ||
      !g.settings ||
      !Array.isArray(g.settings.teams) ||
      g.settings.teams.length !== 2 ||
      !g.settings.teams.every(
        (t) => typeof t === "string" && t.trim().length > 0 && t.length <= 30,
      )
    )
      return null;
    if (
      ![30, 60, 90, 120].includes(g.settings.seconds) ||
      ![1, 2, 3, 4, 5].includes(g.settings.rounds) ||
      ![0, 1, 2, 3, 5].includes(g.settings.passes) ||
      typeof g.settings.sound !== "boolean"
    )
      return null;
    if (
      !["Tümü", "Kolay", "Orta", "Zor"].includes(g.settings.difficulty) ||
      !["Tümü", "Teknoloji", "Sağlık"].includes(g.settings.category)
    )
      return null;
    if (
      !Array.isArray(g.pool) ||
      g.pool.length < 5 ||
      new Set(g.pool).size !== g.pool.length ||
      !g.pool.every((id) => ids.has(id)) ||
      !Array.isArray(g.deck) ||
      !g.deck.length ||
      g.deck.length > 20000 ||
      !g.deck.every((id) => g.pool.includes(id))
    )
      return null;
    if (
      !Number.isInteger(g.cursor) ||
      g.cursor < 0 ||
      g.cursor >= g.deck.length ||
      !Number.isInteger(g.turn) ||
      g.turn < 0 ||
      g.turn >= g.settings.rounds * 2 ||
      !Number.isInteger(g.cycle) ||
      g.cycle < 1
    )
      return null;
    const validPlay = (p: Play) =>
      p &&
      ids.has(p.cardId) &&
      ["correct", "taboo", "pass"].includes(p.outcome);
    if (
      !Array.isArray(g.plays) ||
      !g.plays.every(validPlay) ||
      !Array.isArray(g.history) ||
      !g.history.every(
        (t) =>
          (t.team === 0 || t.team === 1) &&
          Array.isArray(t.plays) &&
          t.plays.every(validPlay) &&
          Number.isFinite(t.score),
      )
    )
      return null;
    if (
      !Array.isArray(g.scores) ||
      g.scores.length !== 2 ||
      !g.scores.every(Number.isFinite) ||
      !["ready", "playing", "paused", "summary", "finished"].includes(
        g.stage,
      ) ||
      !Number.isFinite(g.remaining) ||
      g.remaining < 0 ||
      g.remaining > g.settings.seconds * 1000
    )
      return null;
    return g.stage === "playing" ? { ...g, stage: "paused", deadline: 0 } : g;
  } catch {
    return null;
  }
}
