import type {
  JudgementResult,
  JudgementType,
  NoteType,
  ScoreState
} from "@rhythm-battle/shared";

export type { JudgementResult, JudgementType, ScoreState };

export type GamePhase = "song-select" | "countdown" | "playing" | "paused" | "result";

export type NoteStatus = "pending" | "active" | "hit" | "missed";

export interface NoteObject {
  id: string;
  time: number;
  lane: number;
  type: NoteType;
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

