import {
  ChartFileSchema,
  type ChartAnalysisReport,
  type ChartDifficulty,
  type NoteData
} from "@rhythm-battle/shared";
import type { ChartFile } from "../types/chart";

interface DifficultyDensityTarget {
  maxActiveNps: number;
  maxPeakNps: number;
  recommendedMinGapMs: number;
  allowChords: boolean;
}

const DIFFICULTY_TARGETS: Record<ChartDifficulty, DifficultyDensityTarget> = {
  easy: { maxActiveNps: 1.8, maxPeakNps: 3, recommendedMinGapMs: 350, allowChords: false },
  normal: { maxActiveNps: 2.3, maxPeakNps: 4, recommendedMinGapMs: 240, allowChords: true },
  hard: { maxActiveNps: 3.4, maxPeakNps: 6, recommendedMinGapMs: 180, allowChords: true },
  expert: { maxActiveNps: 5.0, maxPeakNps: 8, recommendedMinGapMs: 95, allowChords: true }
};

function validateNoteTimeline(chart: ChartFile, sortedNotes: readonly NoteData[]): void {
  const lastHoldEndByLane = new Map<number, number>();
  const seenKeys = new Set<string>();

  for (let i = 0; i < sortedNotes.length; i += 1) {
    const note = sortedNotes[i];
    if (!note) {
      continue;
    }

    const noteEnd = note.time + (note.duration ?? 0);
    if (noteEnd > chart.duration) {
      throw new Error(
        `Invalid chart "${chart.id}": note at ${note.time}s (end ${noteEnd}s) exceeds song duration ${chart.duration}s`
      );
    }

    const timeBucket = Math.round(note.time * 1000);
    const dedupeKey = `${timeBucket}:${note.lane}`;
    if (seenKeys.has(dedupeKey)) {
      throw new Error(
        `Invalid chart "${chart.id}": duplicate overlapping note on lane ${note.lane} at ${note.time}s`
      );
    }
    seenKeys.add(dedupeKey);

    const prevHoldEnd = lastHoldEndByLane.get(note.lane);
    if (prevHoldEnd !== undefined && note.time < prevHoldEnd - 0.005) {
      throw new Error(
        `Invalid chart "${chart.id}": note on lane ${note.lane} at ${note.time}s overlaps previous hold tail ending at ${prevHoldEnd}s`
      );
    }

    if (note.type === "hold" && note.duration) {
      lastHoldEndByLane.set(note.lane, note.time + note.duration);
    }
  }
}

export class ChartParser {
  static parse(raw: unknown): ChartFile {
    const parsed = ChartFileSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid chart JSON: ${issues}`);
    }

    const sortedNotes = [...parsed.data.notes].sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return a.lane - b.lane;
    });

    const chart: ChartFile = {
      ...parsed.data,
      notes: sortedNotes
    };

    validateNoteTimeline(chart, sortedNotes);
    return chart;
  }

  static parseList(rawList: readonly unknown[]): ChartFile[] {
    return rawList.map((item) => ChartParser.parse(item));
  }

  static analyze(chart: ChartFile): ChartAnalysisReport {
    const notes = chart.notes;
    const offsetSec = (chart.offsetMs ?? 0) / 1000;
    const beatSec = 60 / chart.bpm;
    const laneDistribution: [number, number, number, number] = [0, 0, 0, 0];
    const warnings: string[] = [];

    let chordCount = 0;
    let holdCount = 0;
    let offBeatCount = 0;
    let sameLaneConsecutiveCount = 0;
    let minGapMs = Infinity;
    let peakNotesPerSec = 0;

    // Sliding 1-second window for peak note density measurement.
    let windowStart = 0;
    for (let i = 0; i < notes.length; i += 1) {
      const note = notes[i];
      if (!note) {
        continue;
      }

      laneDistribution[note.lane] = (laneDistribution[note.lane] ?? 0) + 1;
      if (note.type === "hold") {
        holdCount += 1;
      }

      const shiftedTime = Math.max(0, note.time - offsetSec);
      const beatUnits = shiftedTime / beatSec;
      const sixteenthDelta = Math.abs(beatUnits * 4 - Math.round(beatUnits * 4));
      if (sixteenthDelta > 0.08) {
        offBeatCount += 1;
      }

      while (windowStart < i && note.time - (notes[windowStart]?.time ?? 0) >= 1.0) {
        windowStart += 1;
      }
      peakNotesPerSec = Math.max(peakNotesPerSec, i - windowStart + 1);

      if (i > 0) {
        const prev = notes[i - 1];
        if (prev) {
          const gapMs = Math.round((note.time - prev.time) * 1000);
          if (gapMs === 0) {
            chordCount += 1;
          } else {
            minGapMs = Math.min(minGapMs, gapMs);
            if (note.lane === prev.lane) {
              sameLaneConsecutiveCount += 1;
            }
          }
        }
      }
    }

    const firstTime = notes[0]?.time ?? 0;
    const lastTime = notes[notes.length - 1]?.time ?? 0;
    const activeSpanSec = Math.max(1, lastTime - firstTime);
    const avgNotesPerSec = Number((notes.length / chart.duration).toFixed(2));
    const activeNotesPerSec = Number((notes.length / activeSpanSec).toFixed(2));
    const resolvedMinGapMs = Number.isFinite(minGapMs) ? minGapMs : 0;

    const target = DIFFICULTY_TARGETS[chart.difficulty];
    if (!target.allowChords && chordCount > 0) {
      warnings.push(`Easy chart contains ${chordCount} chord(s); single-note patterns are recommended.`);
    }
    if (resolvedMinGapMs > 0 && resolvedMinGapMs < target.recommendedMinGapMs) {
      warnings.push(
        `Minimum inter-note gap (${resolvedMinGapMs}ms) is tighter than ${chart.difficulty} target (${target.recommendedMinGapMs}ms).`
      );
    }
    if (activeNotesPerSec > target.maxActiveNps) {
      warnings.push(
        `Active density (${activeNotesPerSec} NPS) exceeds ${chart.difficulty} target (${target.maxActiveNps} NPS).`
      );
    }
    if (peakNotesPerSec > target.maxPeakNps) {
      warnings.push(
        `Peak 1s burst (${peakNotesPerSec} notes/s) exceeds ${chart.difficulty} target (${target.maxPeakNps} notes/s).`
      );
    }
    if (offBeatCount > Math.max(2, Math.floor(notes.length * 0.15))) {
      warnings.push(`${offBeatCount} of ${notes.length} notes do not align cleanly to the ${chart.bpm} BPM grid.`);
    }

    return {
      chartId: chart.id,
      difficulty: chart.difficulty,
      bpm: chart.bpm,
      offsetMs: chart.offsetMs ?? 0,
      totalNotes: notes.length,
      chordCount,
      holdCount,
      avgNotesPerSec,
      activeNotesPerSec,
      peakNotesPerSec,
      minGapMs: resolvedMinGapMs,
      offBeatCount,
      sameLaneConsecutiveCount,
      laneDistribution,
      warnings
    };
  }
}
