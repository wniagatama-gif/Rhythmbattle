import { z } from "zod";
import { DEFAULT_GAME_CONFIG, type JudgementType } from "./game";

export const PVP_COMBAT_CONFIG = {
  initialHp: 100,
  maxHp: 100,
  damageDealt: {
    PERFECT: 4,
    GREAT: 2,
    GOOD: 1,
    MISS: 0
  } satisfies Record<JudgementType, number>,
  selfDamage: {
    PERFECT: 0,
    GREAT: 0,
    GOOD: 0,
    MISS: 6
  } satisfies Record<JudgementType, number>,
  specialAttack: {
    comboThreshold: 10,
    cooldownMs: 8000,
    damage: 14
  }
} as const;

export const PvpMatchStateSchema = z.enum([
  "lobby",
  "countdown",
  "playing",
  "finished"
]);
export type PvpMatchState = z.infer<typeof PvpMatchStateSchema>;

export const PvpPlayerSnapshotSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  slot: z.union([z.literal(1), z.literal(2)]),
  connected: z.boolean(),
  ready: z.boolean(),
  hp: z.number(),
  maxHp: z.number(),
  score: z.number(),
  combo: z.number(),
  maxCombo: z.number(),
  accuracy: z.number(),
  judgedNotes: z.number(),
  counts: z.object({
    PERFECT: z.number(),
    GREAT: z.number(),
    GOOD: z.number(),
    MISS: z.number()
  }),
  lastSpecialAtMs: z.number()
});
export type PvpPlayerSnapshot = z.infer<typeof PvpPlayerSnapshotSchema>;

export const PvpRoomSnapshotSchema = z.object({
  roomId: z.string(),
  roomCode: z.string(),
  mode: z.enum(["quick", "private"]),
  hostId: z.string(),
  chartId: z.string(),
  chartVersion: z.string(),
  matchId: z.string().nullable(),
  matchState: PvpMatchStateSchema,
  scheduledStartServerMs: z.number().nullable(),
  players: z.array(PvpPlayerSnapshotSchema)
});
export type PvpRoomSnapshot = z.infer<typeof PvpRoomSnapshotSchema>;

export const PvpClientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hello"),
    playerName: z.string().trim().min(1).max(24),
    playerId: z.string().optional()
  }),
  z.object({
    type: z.literal("quick_match"),
    chartId: z.string().optional()
  }),
  z.object({
    type: z.literal("create_room"),
    chartId: z.string().min(1)
  }),
  z.object({
    type: z.literal("join_room"),
    roomCode: z.string().trim().min(4).max(8)
  }),
  z.object({
    type: z.literal("select_chart"),
    chartId: z.string().min(1)
  }),
  z.object({
    type: z.literal("set_ready"),
    ready: z.boolean()
  }),
  z.object({
    type: z.literal("start_match")
  }),
  z.object({
    type: z.literal("ping"),
    clientTimeMs: z.number().finite()
  }),
  z.object({
    type: z.literal("note_input"),
    lane: z.number().int().min(0).max(DEFAULT_GAME_CONFIG.lanesCount - 1),
    songTimeSec: z.number().finite().nonnegative()
  }),
  z.object({
    type: z.literal("note_miss_timeout"),
    noteIndex: z.number().int().nonnegative()
  }),
  z.object({
    type: z.literal("special_attack")
  }),
  z.object({
    type: z.literal("match_song_ended")
  }),
  z.object({
    type: z.literal("leave_room")
  })
]);
export type PvpClientMessage = z.infer<typeof PvpClientMessageSchema>;

export type PvpFinishReason = "hp_zero" | "song_complete" | "opponent_forfeit";

export type PvpServerMessage =
  | {
      type: "welcome";
      playerId: string;
      playerName: string;
      serverTimeMs: number;
    }
  | {
      type: "pong";
      clientTimeMs: number;
      serverTimeMs: number;
    }
  | {
      type: "matchmaking_status";
      status: "searching" | "idle";
    }
  | {
      type: "room_state";
      room: PvpRoomSnapshot;
    }
  | {
      type: "match_scheduled";
      room: PvpRoomSnapshot;
      matchId: string;
      chartId: string;
      chartVersion: string;
      scheduledStartServerMs: number;
      serverTimeMs: number;
    }
  | {
      type: "note_judged";
      playerId: string;
      noteIndex: number;
      lane: number;
      judgement: JudgementType;
      timingDeltaMs: number;
      damageDealt: number;
      selfDamage: number;
      players: PvpPlayerSnapshot[];
    }
  | {
      type: "special_triggered";
      attackerId: string;
      defenderId: string;
      damage: number;
      players: PvpPlayerSnapshot[];
    }
  | {
      type: "match_finished";
      matchId: string;
      winnerId: string | null;
      reason: PvpFinishReason;
      players: PvpPlayerSnapshot[];
    }
  | {
      type: "opponent_connection";
      playerId: string;
      connected: boolean;
    }
  | {
      type: "error";
      code: string;
      message: string;
    };

