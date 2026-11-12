import { INITIAL_SCORE_STATE, JUDGEMENT_SCORE } from "@rhythm-battle/shared";
import type { JudgementResult, ScoreState } from "../types/game";

export class ScoreEngine {
  private state: ScoreState = {
    ...INITIAL_SCORE_STATE,
    counts: { ...INITIAL_SCORE_STATE.counts }
  };

  reset(totalNotes: number): void {
    this.state = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      totalNotes,
      judgedNotes: 0,
      counts: { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 },
      accuracy: 100
    };
  }

  getMultiplier(combo: number): number {
    if (combo >= 50) {
      return 4;
    }
    if (combo >= 25) {
      return 3;
    }
    if (combo >= 10) {
      return 2;
    }
    return 1;
  }

  apply(result: JudgementResult): ScoreState {
    this.state.counts[result.type] += 1;
    this.state.judgedNotes += 1;

    if (result.type === "MISS") {
      this.state.combo = 0;
    } else {
      const multiplier = this.getMultiplier(this.state.combo);
      this.state.combo += 1;
      if (this.state.combo > this.state.maxCombo) {
        this.state.maxCombo = this.state.combo;
      }
      this.state.score += JUDGEMENT_SCORE[result.type] * multiplier;
    }

    if (this.state.judgedNotes > 0) {
      this.state.accuracy = Number(
        ((this.state.counts.PERFECT / this.state.judgedNotes) * 100).toFixed(1)
      );
    }

    return this.getState();
  }

  getState(): ScoreState {
    return {
      ...this.state,
      counts: { ...this.state.counts }
    };
  }
}

