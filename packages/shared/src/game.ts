import { z } from "zod";

export interface GameBaseConfig {
  defaultBpm: number;
  minBpm: number;
  maxBpm: number;
  hitWindowMs: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
  lanesCount: number;
  audioOffsetMs: number;
}

export const DEFAULT_GAME_CONFIG: GameBaseConfig = {
  defaultBpm: 120,
  minBpm: 60,
  maxBpm: 300,
  hitWindowMs: {
    perfect: 45,
    great: 90,
    good: 135,
    miss: 180
  },
  lanesCount: 4,
  audioOffsetMs: 0
};

export const LANE_DIRECTION_INDEX = {
  left: 0,
  down: 1,
  up: 2,
  right: 3
} as const;

export const LaneDirectionSchema = z.enum(["left", "down", "up", "right"]);
export type LaneDirection = z.infer<typeof LaneDirectionSchema>;

export const NoteTypeSchema = z.enum(["tap", "hold"]);

const LaneIndexSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized in LANE_DIRECTION_INDEX) {
      return LANE_DIRECTION_INDEX[normalized as LaneDirection];
    }
  }
  return value;
}, z.number().int().min(0).max(DEFAULT_GAME_CONFIG.lanesCount - 1));

export const NoteDataSchema = z.object({
  time: z.number().finite().nonnegative(),
  lane: LaneIndexSchema,
  type: NoteTypeSchema,
  duration: z.number().finite().positive().optional()
});

export const BpmEventSchema = z.object({
  time: z.number().finite().nonnegative(),
  bpm: z.number().finite().positive()
});

export const ChartDifficultySchema = z.enum(["easy", "normal", "hard", "expert"]);

export const ChartFileSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1),
  bpm: z.number().finite().positive(),
  audioFile: z.string(),
  duration: z.number().finite().positive(),
  difficulty: ChartDifficultySchema,
  notes: z.array(NoteDataSchema).min(1),
  bpmEvents: z.array(BpmEventSchema).optional()
});

export type NoteType = z.infer<typeof NoteTypeSchema>;
export type NoteData = z.infer<typeof NoteDataSchema>;
export type BpmEvent = z.infer<typeof BpmEventSchema>;
export type ChartDifficulty = z.infer<typeof ChartDifficultySchema>;
export type ChartFile = z.infer<typeof ChartFileSchema>;

export type JudgementType = "PERFECT" | "GREAT" | "GOOD" | "MISS";

export interface JudgementResult {
  type: JudgementType;
  timingDeltaMs: number;
  noteId: string;
  lane: number;
  timestamp: number;
}

export const JUDGEMENT_SCORE: Record<JudgementType, number> = {
  PERFECT: 300,
  GREAT: 200,
  GOOD: 100,
  MISS: 0
};

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  totalNotes: number;
  judgedNotes: number;
  counts: Record<JudgementType, number>;
  accuracy: number;
}

export const INITIAL_SCORE_STATE: ScoreState = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  totalNotes: 0,
  judgedNotes: 0,
  counts: { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 },
  accuracy: 100
};
