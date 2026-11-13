import { describe, expect, test } from "bun:test";
import { RAW_CHART_FILES } from "../packages/game-data/src";
import { ChartParser } from "../apps/web/src/game/engine/ChartParser";
import { InputHandler } from "../apps/web/src/game/engine/InputHandler";
import { JudgementEngine } from "../apps/web/src/game/engine/JudgementEngine";
import { NoteManager } from "../apps/web/src/game/engine/NoteManager";
import { ScoreEngine } from "../apps/web/src/game/engine/ScoreEngine";
import { HIT_ZONE_Y, LANE_CONFIG, LANE_KEYS, LANE_LABELS } from "../apps/web/src/game/constants";

describe("Final Lane Order & Keyboard Mapping", () => {
  test("centralizes LEFT -> DOWN -> UP -> RIGHT order and Arrow key mapping", () => {
    expect(LANE_CONFIG.map((lane) => lane.id)).toEqual(["left", "down", "up", "right"]);
    expect(LANE_KEYS).toEqual(["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight"]);
    expect(LANE_LABELS).toEqual(["←", "↓", "↑", "→"]);

    const pressedLanes: number[] = [];
    const releasedLanes: number[] = [];
    const input = new InputHandler({
      onLanePress: (lane) => pressedLanes.push(lane),
      onLaneRelease: (lane) => releasedLanes.push(lane)
    });

    expect(input.getLaneForKey("ArrowLeft")).toBe(0);
    expect(input.getLaneForKey("ArrowDown")).toBe(1);
    expect(input.getLaneForKey("ArrowUp")).toBe(2);
    expect(input.getLaneForKey("ArrowRight")).toBe(3);

    input.triggerPress(input.getLaneForKey("ArrowLeft") ?? -1);
    input.triggerPress(input.getLaneForKey("ArrowDown") ?? -1);
    input.triggerPress(input.getLaneForKey("ArrowUp") ?? -1);
    input.triggerPress(input.getLaneForKey("ArrowRight") ?? -1);
    expect(pressedLanes).toEqual([0, 1, 2, 3]);

    input.triggerRelease(1);
    expect(releasedLanes).toEqual([1]);
  });
});

describe("ChartParser & Chart Balancing", () => {
  test("parses all four difficulty charts with balanced density and zero validation warnings", () => {
    const charts = ChartParser.parseList(RAW_CHART_FILES);
    expect(charts.length).toBe(4);
    expect(charts.map((chart) => chart.id)).toEqual([
      "demo-song-001-easy",
      "demo-song-001",
      "stream-drill-002",
      "stream-drill-002-expert"
    ]);
    expect(charts.map((chart) => chart.difficulty)).toEqual([
      "easy",
      "normal",
      "hard",
      "expert"
    ]);

    const reports = charts.map((chart) => ChartParser.analyze(chart));
    for (const report of reports) {
      expect(report.warnings).toEqual([]);
      expect(report.offBeatCount).toBe(0);
    }

    // Verify progressive note density across Easy -> Normal -> Hard -> Expert.
    expect(reports[0]!.avgNotesPerSec).toBeLessThan(reports[1]!.avgNotesPerSec);
    expect(reports[1]!.avgNotesPerSec).toBeLessThan(reports[2]!.avgNotesPerSec);
    expect(reports[2]!.avgNotesPerSec).toBeLessThan(reports[3]!.avgNotesPerSec);

    expect(reports[0]!.minGapMs).toBeGreaterThanOrEqual(400);
    expect(reports[1]!.minGapMs).toBeGreaterThanOrEqual(250);
    expect(reports[2]!.minGapMs).toBeGreaterThanOrEqual(200);
    expect(reports[3]!.minGapMs).toBeGreaterThanOrEqual(100);
  });

  test("sorts chronological notes on parse", () => {
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

  test("maps string lane identifiers (left, down, up, right) to final indices 0..3", () => {
    const chartWithStringLanes = ChartParser.parse({
      id: "string-lane-test",
      title: "String Lane Test",
      artist: "Tester",
      bpm: 120,
      audioFile: "",
      duration: 10,
      difficulty: "normal",
      notes: [
        { time: 1.0, lane: "left", type: "tap" },
        { time: 1.5, lane: "down", type: "tap" },
        { time: 2.0, lane: "up", type: "tap" },
        { time: 2.5, lane: "right", type: "hold", duration: 0.5 }
      ]
    });

    expect(chartWithStringLanes.notes.map((note) => note.lane)).toEqual([0, 1, 2, 3]);
    expect(chartWithStringLanes.notes[3]?.duration).toBe(0.5);
  });

  test("rejects invalid chart JSON, out-of-bounds notes, duplicate stacks, and overlapping holds", () => {
    expect(() =>
      ChartParser.parse({
        id: "",
        title: "Broken",
        notes: [{ time: 1, lane: 9, type: "tap" }]
      })
    ).toThrow();

    expect(() =>
      ChartParser.parse({
        id: "oob-note",
        title: "Out of Bounds",
        artist: "Tester",
        bpm: 120,
        audioFile: "",
        duration: 5,
        difficulty: "easy",
        notes: [{ time: 5.5, lane: 0, type: "tap" }]
      })
    ).toThrow(/exceeds song duration/);

    expect(() =>
      ChartParser.parse({
        id: "dup-note",
        title: "Duplicate Stack",
        artist: "Tester",
        bpm: 120,
        audioFile: "",
        duration: 5,
        difficulty: "normal",
        notes: [
          { time: 1.0, lane: 2, type: "tap" },
          { time: 1.0, lane: 2, type: "tap" }
        ]
      })
    ).toThrow(/duplicate overlapping note/);

    expect(() =>
      ChartParser.parse({
        id: "overlap-hold",
        title: "Overlap Hold",
        artist: "Tester",
        bpm: 120,
        audioFile: "",
        duration: 5,
        difficulty: "normal",
        notes: [
          { time: 1.0, lane: 1, type: "hold", duration: 1.0 },
          { time: 1.5, lane: 1, type: "tap" }
        ]
      })
    ).toThrow(/overlaps previous hold tail/);
  });

  test("warns on over-dense Easy patterns while still permitting valid chords", () => {
    const denseEasy = ChartParser.parse({
      id: "dense-easy",
      title: "Dense Easy",
      artist: "Tester",
      bpm: 120,
      audioFile: "",
      duration: 5,
      difficulty: "easy",
      notes: [
        { time: 1.0, lane: 0, type: "tap" },
        { time: 1.0, lane: 3, type: "tap" },
        { time: 1.25, lane: 1, type: "tap" },
        { time: 1.5, lane: 2, type: "tap" }
      ]
    });

    const report = ChartParser.analyze(denseEasy);
    expect(report.chordCount).toBe(1);
    expect(report.warnings.length).toBeGreaterThanOrEqual(2);
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

    // Bottom-to-top: at t = 0.5s with scrollSpeed = 600 px/s, note at t = 1.0s sits 300px below HIT_ZONE_Y.
    const missedEarly = manager.update(0.5, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());
    expect(missedEarly.length).toBe(0);

    const candidate = manager.findCandidateNote(0, 1.02, judgement.getMaxHitWindowMs());
    expect(candidate).not.toBeNull();
    if (candidate) {
      expect(candidate.y).toBeCloseTo(HIT_ZONE_Y + 300, 1);
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

  test("tracks hold notes from hit through sustain duration completion", () => {
    const manager = new NoteManager();
    const judgement = new JudgementEngine();
    const chart = ChartParser.parse({
      id: "hold-test",
      title: "Hold Test",
      artist: "Tester",
      bpm: 120,
      audioFile: "",
      duration: 10,
      difficulty: "normal",
      notes: [{ time: 1.0, lane: 1, type: "hold", duration: 0.6 }]
    });

    manager.loadChart(chart);
    manager.update(1.0, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());

    const head = manager.findCandidateNote(1, 1.0, judgement.getMaxHitWindowMs());
    expect(head).not.toBeNull();
    if (head) {
      manager.markHit(head.id);
      expect(head.status).toBe("holding");
    }

    // While still inside sustain duration (1.3s < 1.6s), hold stays active.
    manager.update(1.3, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());
    expect(manager.areAllNotesJudged()).toBe(false);

    // At end of sustain duration (1.65s >= 1.6s), hold completes.
    manager.update(1.65, 600, HIT_ZONE_Y, judgement.getLateMissThresholdMs());
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
