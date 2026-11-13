import type {
  JudgementResult,
  JudgementType,
  NoteType,
  ScoreState
} from "@rhythm-battle/shared";

export type { JudgementResult, JudgementType, ScoreState };

export type GamePhase = "song-select" | "countdown" | "playing" | "paused" | "result";

export type NoteStatus = "pending" | "active" | "holding" | "hit" | "missed";

export type CharacterAnimState =
  | "idle"
  | "singLeft"
  | "singDown"
  | "singUp"
  | "singRight"
  | "miss"
  | "hurt"
  | "special"
  | "victory"
  | "defeat";

export interface NoteObject {
  id: string;
  index: number;
  time: number;
  lane: number;
  type: NoteType;
  duration?: number;
  y: number;
  status: NoteStatus;
}

export interface GameSnapshot {
  phase: GamePhase;
  currentTime: number;
  duration: number;
  scoreState: ScoreState;
  lastJudgement: JudgementResult | null;
  countdownLabel: string;
  activeLanes: boolean[];
}
