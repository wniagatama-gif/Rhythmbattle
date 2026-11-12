import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNTDOWN_STEP_MS,
  COUNTDOWN_STEPS,
  DEFAULT_SCROLL_SPEED,
  HIT_ZONE_Y,
  LANE_COLORS,
  LANE_COUNT,
  LANE_LABELS,
  NOTE_HEIGHT,
  NOTE_WIDTH,
  SONG_END_TAIL_SEC
} from "../constants";
import type { ChartFile } from "../types/chart";
import type { GamePhase, GameSnapshot, JudgementResult } from "../types/game";
import { AudioEngine } from "./AudioEngine";
import { ChartParser } from "./ChartParser";
import { InputHandler } from "./InputHandler";
import { JudgementEngine } from "./JudgementEngine";
import { NoteManager } from "./NoteManager";
import { ScoreEngine } from "./ScoreEngine";

export type GameSnapshotListener = (snapshot: GameSnapshot) => void;

export class GameEngine {
  private readonly audio = new AudioEngine();
  private readonly notes = new NoteManager();
  private readonly judgement = new JudgementEngine();
  private readonly score = new ScoreEngine();
  private readonly input: InputHandler;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private countdownTimerId: number | null = null;

  private chart: ChartFile | null = null;
  private phase: GamePhase = "song-select";
  private scrollSpeed = DEFAULT_SCROLL_SPEED;
  private countdownLabel = "";
  private lastJudgement: JudgementResult | null = null;
  private activeLanes: boolean[] = [false, false, false, false];
  private listener: GameSnapshotListener | null = null;

  constructor(listener?: GameSnapshotListener) {
    this.listener = listener ?? null;
    this.input = new InputHandler({
      onLanePress: (lane) => this.handleLanePress(lane),
      onLaneRelease: (lane) => this.handleLaneRelease(lane)
    });
  }

  setListener(listener: GameSnapshotListener | null): void {
    this.listener = listener;
  }

  attachCanvas(canvas: HTMLCanvasElement | null): void {
    this.canvas = canvas;
    if (!canvas) {
      this.ctx = null;
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    const context = canvas.getContext("2d");
    if (context) {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    this.ctx = context;
    this.renderFrame();
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
  }

  async startChart(rawChart: unknown): Promise<ChartFile> {
    this.stopCurrentRun();

    const parsedChart = ChartParser.parse(rawChart);
    this.chart = parsedChart;
    this.notes.loadChart(parsedChart);
    this.score.reset(this.notes.getTotalNotes());
    this.lastJudgement = null;
    this.activeLanes = [false, false, false, false];

    await this.audio.load(parsedChart);

    this.phase = "countdown";
    this.emitSnapshot();
    this.runCountdown(0);

    return parsedChart;
  }

  private runCountdown(stepIndex: number): void {
    if (this.phase !== "countdown") {
      return;
    }

    if (stepIndex >= COUNTDOWN_STEPS.length) {
      this.countdownLabel = "";
      this.phase = "playing";
      this.input.attach();
      this.audio.play(0);
      this.emitSnapshot();
      this.startLoop();
      return;
    }

    this.countdownLabel = COUNTDOWN_STEPS[stepIndex] ?? "";
    this.emitSnapshot();
    this.renderFrame();

    this.countdownTimerId = window.setTimeout(() => {
      this.runCountdown(stepIndex + 1);
    }, COUNTDOWN_STEP_MS);
  }

  private startLoop(): void {
    this.stopLoop();
    const tick = (): void => {
      if (this.phase !== "playing") {
        return;
      }

      const currentTime = this.audio.getCurrentTime();
      const missedNotes = this.notes.update(
        currentTime,
        this.scrollSpeed,
        HIT_ZONE_Y,
        this.judgement.getLateMissThresholdMs()
      );

      for (const missed of missedNotes) {
        const result = this.judgement.createAutoMiss(missed, currentTime);
        this.lastJudgement = result;
        this.score.apply(result);
      }

      this.renderFrame();
      this.emitSnapshot();

      const lastNote = this.chart?.notes[this.chart.notes.length - 1];
      const finishTime = Math.max(
        this.audio.getDuration(),
        (lastNote?.time ?? 0) + SONG_END_TAIL_SEC
      );

      if (this.notes.areAllNotesJudged() && currentTime >= (lastNote?.time ?? 0) + SONG_END_TAIL_SEC) {
        this.finishSong();
        return;
      }

      if (currentTime >= finishTime) {
        this.finishSong();
        return;
      }

      this.rafId = window.requestAnimationFrame(tick);
    };

    this.rafId = window.requestAnimationFrame(tick);
  }

  private finishSong(): void {
    this.stopLoop();
    this.input.detach();
    this.audio.stop();
    this.phase = "result";
    this.activeLanes = [false, false, false, false];
    this.emitSnapshot();
  }

  pause(): void {
    if (this.phase !== "playing") {
      return;
    }
    this.stopLoop();
    this.input.detach();
    this.audio.pause();
    this.activeLanes = [false, false, false, false];
    this.phase = "paused";
    this.emitSnapshot();
  }

  resume(): void {
    if (this.phase !== "paused") {
      return;
    }
    this.phase = "playing";
    this.input.attach();
    this.audio.resume();
    this.emitSnapshot();
    this.startLoop();
  }

  stopToSelect(): void {
    this.stopCurrentRun();
    this.phase = "song-select";
    this.emitSnapshot();
  }

  triggerLanePress(lane: number): void {
    this.input.triggerPress(lane);
  }

  triggerLaneRelease(lane: number): void {
    this.input.triggerRelease(lane);
  }

  private handleLanePress(lane: number): void {
    if (this.phase !== "playing" || lane < 0 || lane >= LANE_COUNT) {
      return;
    }

    this.activeLanes[lane] = true;
    const currentTime = this.audio.getCurrentTime();
    const candidate = this.notes.findCandidateNote(
      lane,
      currentTime,
      this.judgement.getMaxHitWindowMs()
    );

    if (candidate) {
      const result = this.judgement.evaluateHit(candidate, currentTime);
      this.notes.markHit(candidate.id);
      this.lastJudgement = result;
      this.score.apply(result);
      if (result.type !== "MISS") {
        this.audio.playHitCue(lane);
      }
      this.emitSnapshot();
    }

    this.renderFrame();
  }

  private handleLaneRelease(lane: number): void {
    if (lane < 0 || lane >= LANE_COUNT) {
      return;
    }
    this.activeLanes[lane] = false;
    this.renderFrame();
  }

  private renderFrame(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#111318";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const laneWidth = CANVAS_WIDTH / LANE_COUNT;

    // Draw lane tracks and active press highlight.
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const x = lane * laneWidth;

      if (this.activeLanes[lane]) {
        ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
        ctx.fillRect(x, 0, laneWidth, CANVAS_HEIGHT);
      } else if (lane % 2 === 1) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        ctx.fillRect(x, 0, laneWidth, CANVAS_HEIGHT);
      }

      if (lane > 0) {
        ctx.strokeStyle = "#2E3442";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
    }

    // Draw horizontal hit-zone baseline.
    ctx.strokeStyle = "#F43F5E";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, HIT_ZONE_Y);
    ctx.lineTo(CANVAS_WIDTH, HIT_ZONE_Y);
    ctx.stroke();

    // Draw receptor boxes and arrow labels inside the hit zone.
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const centerX = lane * laneWidth + laneWidth / 2;
      const boxX = centerX - NOTE_WIDTH / 2;
      const boxY = HIT_ZONE_Y - NOTE_HEIGHT / 2;
      const laneColor = LANE_COLORS[lane] ?? "#F3F4F6";

      ctx.strokeStyle = this.activeLanes[lane] ? laneColor : "#64748B";
      ctx.lineWidth = this.activeLanes[lane] ? 2.5 : 1.5;
      ctx.fillStyle = this.activeLanes[lane] ? "rgba(255,255,255,0.10)" : "#181B22";
      ctx.fillRect(boxX, boxY, NOTE_WIDTH, NOTE_HEIGHT);
      ctx.strokeRect(boxX, boxY, NOTE_WIDTH, NOTE_HEIGHT);

      ctx.fillStyle = this.activeLanes[lane] ? "#F3F4F6" : "#A8B0BF";
      ctx.font = "600 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(LANE_LABELS[lane] ?? "", centerX, HIT_ZONE_Y);
    }

    // Draw falling notes.
    const visibleNotes = this.notes.getVisibleNotes(CANVAS_HEIGHT);
    for (const note of visibleNotes) {
      const centerX = note.lane * laneWidth + laneWidth / 2;
      const noteX = centerX - NOTE_WIDTH / 2;
      const noteY = note.y - NOTE_HEIGHT / 2;
      const laneColor = LANE_COLORS[note.lane] ?? "#F3F4F6";

      ctx.fillStyle = laneColor;
      ctx.fillRect(noteX, noteY, NOTE_WIDTH, NOTE_HEIGHT);

      ctx.strokeStyle = "#111318";
      ctx.lineWidth = 2;
      ctx.strokeRect(noteX, noteY, NOTE_WIDTH, NOTE_HEIGHT);

      ctx.fillStyle = "#111318";
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(LANE_LABELS[note.lane] ?? "", centerX, note.y);
    }
  }

  private emitSnapshot(): void {
    if (!this.listener) {
      return;
    }
    this.listener({
      phase: this.phase,
      currentTime: this.audio.getCurrentTime(),
      duration: this.audio.getDuration(),
      scoreState: this.score.getState(),
      lastJudgement: this.lastJudgement,
      countdownLabel: this.countdownLabel,
      activeLanes: [...this.activeLanes]
    });
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private stopCurrentRun(): void {
    if (this.countdownTimerId !== null) {
      window.clearTimeout(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    this.stopLoop();
    this.input.detach();
    this.audio.stop();
    this.countdownLabel = "";
  }

  destroy(): void {
    this.stopCurrentRun();
    this.audio.dispose();
    this.listener = null;
  }
}

