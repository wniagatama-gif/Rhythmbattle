import { describe, expect, test } from "bun:test";
import { RAW_CHART_FILES } from "../packages/game-data/src";
import { ChartParser } from "../apps/web/src/game/engine/ChartParser";
import { JudgementEngine } from "../apps/web/src/game/engine/JudgementEngine";
import { NoteManager } from "../apps/web/src/game/engine/NoteManager";
import { ScoreEngine } from "../apps/web/src/game/engine/ScoreEngine";
import { HIT_ZONE_Y } from "../apps/web/src/game/constants";

describe("ChartParser", () => {
  test("parses all bundled chart JSON files and sorts notes chronologically", () => {
    const charts = ChartParser.parseList(RAW_CHART_FILES);
    expect(charts.length).toBe(2);
    expect(charts[0]?.id).toBe("demo-song-001");
    expect(charts[1]?.id).toBe("stream-drill-002");

    const unordered = {
      id: "sort-test",
      title: "Sort Test",
      artist: "Tester",
      bpm: 120,
      audioFile: "",
      duration: 10,
      difficulty: "normal",
      notes: [
        { time: 2.0, lane: 3, type: "tap" },
        { time: 1.0, lane: 2, type: "tap" },
        { time: 1.0, lane: 0, type: "tap" }
      ]
    };

    const parsed = ChartParser.parse(unordered);
    expect(parsed.notes[0]).toEqual({ time: 1.0, lane: 0, type: "tap" });
    expect(parsed.notes[1]).toEqual({ time: 1.0, lane: 2, type: "tap" });
    expect(parsed.notes[2]).toEqual({ time: 2.0, lane: 3, type: "tap" });
  });

  test("rejects invalid chart JSON", () => {
    expect(() =>
      ChartParser.parse({
        id: "",
        title: "Broken",
        notes: [{ time: 1, lane: 9, type: "tap" }]
      })
    ).toThrow();
  });
});

describe("NoteManager & JudgementEngine", () => {
  test("updates y position based on audio time and scroll speed, and marks late notes as missed", () => {
    const manager = new NoteManager();
    const judgement = new JudgementEngine();
    const chart = ChartParser.parse({
      id: "timing-test",
      title: "Timing Test",
      artist: "Tester",
      bpm: 120,
      audioFile: "",
      duration: 10,
      difficulty: "easy",
      notes: [
        { time: 1.0, lane: 0, type: "tap" },
        { time: 2.0, lane: 1, type: "tap" }
      ]
    });

    manager.loadChart(chart);

    // At t = 0.5s with scrollSpeed = 600 px/s, note at t = 1.0s should be 300px above HIT_ZONE_Y.
    const missedEarly = manager.update(0.5, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());
    expect(missedEarly.length).toBe(0);

    const candidate = manager.findCandidateNote(0, 1.02, judgement.getMaxHitWindowMs());
    expect(candidate).not.toBeNull();
    if (candidate) {
      expect(candidate.y).toBeCloseTo(HIT_ZONE_Y - 300, 1);
      const hitResult = judgement.evaluateHit(candidate, 1.02); // +20ms
      expect(hitResult.type).toBe("PERFECT");
      manager.markHit(candidate.id);
    }

    // At t = 2.15s (+150ms > 135ms), note 2 should transition to missed.
    const missedLate = manager.update(2.15, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());
    expect(missedLate.length).toBe(1);
    expect(missedLate[0]?.lane).toBe(1);
    expect(manager.areAllNotesJudged()).toBe(true);
  });

  test("evaluates PERFECT, GREAT, GOOD, and MISS timing windows accurately", () => {
    const judgement = new JudgementEngine();
    const note = {
      id: "n-1",
      time: 5.0,
      lane: 2,
      type: "tap" as const,
      y: HIT_ZONE_Y,
      status: "active" as const
    };

    expect(judgement.evaluateHit(note, 5.04).type).toBe("PERFECT");
    expect(judgement.evaluateHit(note, 4.96).type).toBe("PERFECT");
    expect(judgement.evaluateHit(note, 5.08).type).toBe("GREAT");
    expect(judgement.evaluateHit(note, 5.13).type).toBe("GOOD");
    expect(judgement.evaluateHit(note, 5.16).type).toBe("MISS");
  });
});

describe("ScoreEngine", () => {
  test("calculates combo multipliers (1x, 2x, 3x, 4x), resets on miss, and computes accuracy including misses", () => {
    const score = new ScoreEngine();
    score.reset(12);

    // 10 consecutive PERFECT hits: combos 0..9 use 1x (10 * 300 = 3000)
    for (let i = 0; i < 10; i += 1) {
      score.apply({
        type: "PERFECT",
        timingDeltaMs: 0,
        noteId: `n-${i}`,
        lane: 0,
        timestamp: i
      });
    }
    expect(score.getState().combo).toBe(10);
    expect(score.getState().score).toBe(3000);

    // 11th hit uses 2x multiplier: 300 * 2 = 600 -> total 3600
    score.apply({
      type: "PERFECT",
      timingDeltaMs: 5,
      noteId: "n-10",
      lane: 1,
      timestamp: 10
    });
    expect(score.getState().score).toBe(3600);
    expect(score.getState().maxCombo).toBe(11);

    // 12th note is MISS: combo resets to 0, accuracy = 11 / 12 = 91.7%
    const finalState = score.apply({
      type: "MISS",
      timingDeltaMs: 150,
      noteId: "n-11",
      lane: 2,
      timestamp: 11
    });
    expect(finalState.combo).toBe(0);
    expect(finalState.maxCombo).toBe(11);
    expect(finalState.counts.MISS).toBe(1);
    expect(finalState.accuracy).toBe(91.7);
  });
});

