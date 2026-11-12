import { NOTE_HEIGHT } from "../constants";
import type { ChartFile } from "../types/chart";
import type { NoteObject } from "../types/game";

export class NoteManager {
  private notes: NoteObject[] = [];

  loadChart(chart: ChartFile): void {
    this.notes = chart.notes.map((note, index) => ({
      id: `${chart.id}-note-${index}`,
      time: note.time,
      lane: note.lane,
      type: note.type,
      y: -NOTE_HEIGHT * 2,
      status: "pending"
    }));
  }

  update(
    currentTime: number,
    scrollSpeed: number,
    hitZoneY: number,
    missWindowMs: number
  ): NoteObject[] {
    const newlyMissed: NoteObject[] = [];

    for (const note of this.notes) {
      if (note.status === "hit" || note.status === "missed") {
        continue;
      }

      const timeDiffSec = note.time - currentTime;
      note.y = hitZoneY - timeDiffSec * scrollSpeed;

      if (note.status === "pending" && note.y >= -NOTE_HEIGHT) {
        note.status = "active";
      }

      const lateMs = (currentTime - note.time) * 1000;
      if (lateMs > missWindowMs) {
        note.status = "missed";
        newlyMissed.push(note);
      }
    }

    return newlyMissed;
  }

  findCandidateNote(lane: number, currentTime: number, maxWindowMs: number): NoteObject | null {
    let bestNote: NoteObject | null = null;
    let bestAbsDeltaMs = Infinity;

    for (const note of this.notes) {
      if (note.lane !== lane) {
        continue;
      }
      if (note.status !== "pending" && note.status !== "active") {
        continue;
      }

      const absDeltaMs = Math.abs(currentTime - note.time) * 1000;
      if (absDeltaMs <= maxWindowMs && absDeltaMs < bestAbsDeltaMs) {
        bestAbsDeltaMs = absDeltaMs;
        bestNote = note;
      }
    }

    return bestNote;
  }

  markHit(noteId: string): void {
    const note = this.notes.find((item) => item.id === noteId);
    if (note) {
      note.status = "hit";
    }
  }

  getVisibleNotes(canvasHeight: number): readonly NoteObject[] {
    return this.notes.filter(
      (note) =>
        (note.status === "pending" || note.status === "active") &&
        note.y >= -NOTE_HEIGHT &&
        note.y <= canvasHeight + NOTE_HEIGHT
    );
  }

  getTotalNotes(): number {
    return this.notes.length;
  }

  areAllNotesJudged(): boolean {
    return this.notes.every((note) => note.status === "hit" || note.status === "missed");
  }
}

