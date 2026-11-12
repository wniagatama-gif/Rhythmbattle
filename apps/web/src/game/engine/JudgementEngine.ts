import { DEFAULT_GAME_CONFIG } from "@rhythm-battle/shared";
import type { JudgementResult, JudgementType, NoteObject } from "../types/game";

export class JudgementEngine {
  private readonly windows = DEFAULT_GAME_CONFIG.hitWindowMs;

  getMaxHitWindowMs(): number {
    return this.windows.miss;
  }

  getLateMissThresholdMs(): number {
    return this.windows.good;
  }

  evaluateHit(note: NoteObject, inputTimeSec: number): JudgementResult {
    const timingDeltaMs = (inputTimeSec - note.time) * 1000;
    const absDeltaMs = Math.abs(timingDeltaMs);

    let type: JudgementType = "MISS";
    if (absDeltaMs <= this.windows.perfect) {
      type = "PERFECT";
    } else if (absDeltaMs <= this.windows.great) {
      type = "GREAT";
    } else if (absDeltaMs <= this.windows.good) {
      type = "GOOD";
    }

    return {
      type,
      timingDeltaMs,
      noteId: note.id,
      lane: note.lane,
      timestamp: performance.now()
    };
  }

  createAutoMiss(note: NoteObject, currentTimeSec: number): JudgementResult {
    return {
      type: "MISS",
      timingDeltaMs: (currentTimeSec - note.time) * 1000,
      noteId: note.id,
      lane: note.lane,
      timestamp: performance.now()
    };
  }
}

