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
      duration: note.duration,
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

      if (note.status === "holding") {
        const endTime = note.time + (note.duration ?? 0);
        if (currentTime >= endTime) {
          note.status = "hit";
        }
        continue;
      }

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
    if (!note) {
      return;
    }
    if (note.type === "hold" && (note.duration ?? 0) > 0) {
      note.status = "holding";
      return;
    }
    note.status = "hit";
  }

  releaseHold(lane: number, currentTime: number): boolean {
    const held = this.notes.find((item) => item.lane === lane && item.status === "holding");
    if (!held) {
      return false;
    }
    const endTime = held.time + (held.duration ?? 0);
    // Allow small 120ms release grace near the end of a sustain tail.
    held.status = currentTime >= endTime - 0.12 ? "hit" : "missed";
    return held.status === "hit";
  }

  getVisibleNotes(canvasHeight: number, scrollSpeed = 600): readonly NoteObject[] {
    return this.notes.filter((note) => {
      if (note.status !== "pending" && note.status !== "active" && note.status !== "holding") {
        return false;
      }
      const tailHeight = (note.duration ?? 0) * scrollSpeed;
      const topY = note.y - tailHeight - NOTE_HEIGHT;
      const bottomY = note.y + NOTE_HEIGHT;
      return bottomY >= -NOTE_HEIGHT && topY <= canvasHeight + NOTE_HEIGHT;
    });
  }

  getTotalNotes(): number {
    return this.notes.length;
  }

  areAllNotesJudged(): boolean {
    return this.notes.every((note) => note.status === "hit" || note.status === "missed");
  }
}
