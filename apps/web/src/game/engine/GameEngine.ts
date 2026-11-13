import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNTDOWN_STEP_MS,
  COUNTDOWN_STEPS,
  DEFAULT_SCROLL_SPEED,
  HIT_ZONE_Y,
  LANE_CONFIG,
  LANE_COUNT,
  NOTE_HEIGHT,
  NOTE_WIDTH,
  SONG_END_TAIL_SEC
} from "../constants";
import type { ChartFile } from "../types/chart";
import type { GamePhase, GameSnapshot, JudgementResult, NoteObject } from "../types/game";
import { AudioEngine } from "./AudioEngine";
import { ChartParser } from "./ChartParser";
import { getCachedFnFAssets, loadFnFAssets, type FnFAssets } from "./FnFAssetLoader";
import { drawAtlasFrame, getAtlasFrame, NOTE_ATLAS_MAP } from "./FnFNoteRenderer";
import { InputHandler } from "./InputHandler";
import { JudgementEngine } from "./JudgementEngine";
import { NoteManager } from "./NoteManager";
import { ScoreEngine } from "./ScoreEngine";

export type GameSnapshotListener = (snapshot: GameSnapshot) => void;

export interface PvpEngineBridge {
  onNoteAttempt: (lane: number, songTimeSec: number) => void;
  onAutoMiss: (noteIndex: number) => void;
  onSongFinished: () => void;
}

interface LaneVisualEffect {
  lane: number;
  kind: "hit" | "miss";
  createdAt: number;
  durationMs: number;
}

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
  private laneEffects: LaneVisualEffect[] = [];
  private listener: GameSnapshotListener | null = null;
  private pvpBridge: PvpEngineBridge | null = null;

  private fnfAssets: FnFAssets | null = null;

  constructor(listener?: GameSnapshotListener) {
    this.listener = listener ?? null;
    this.input = new InputHandler({
      onLanePress: (lane) => this.handleLanePress(lane),
      onLaneRelease: (lane) => this.handleLaneRelease(lane)
    });
    this.fnfAssets = getCachedFnFAssets();
    if (!this.fnfAssets) {
      void loadFnFAssets().then((assets) => {
        this.fnfAssets = assets;
        this.renderFrame();
      }).catch(() => {
        // Fallback to vector arrows if loading fails
      });
    }
  }

  setListener(listener: GameSnapshotListener | null): void {
    this.listener = listener;
  }

  setPvpBridge(bridge: PvpEngineBridge | null): void {
    this.pvpBridge = bridge;
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
    this.laneEffects = [];

    await this.audio.load(parsedChart);

    this.phase = "countdown";
    this.emitSnapshot();
    this.runCountdown(0);

    return parsedChart;
  }

  async startSynchronizedChart(rawChart: unknown, startDelayMs: number): Promise<ChartFile> {
    this.stopCurrentRun();

    const parsedChart = ChartParser.parse(rawChart);
    this.chart = parsedChart;
    this.notes.loadChart(parsedChart);
    this.score.reset(this.notes.getTotalNotes());
    this.lastJudgement = null;
    this.activeLanes = [false, false, false, false];
    this.laneEffects = [];

    await this.audio.load(parsedChart);

    const clampedDelay = Math.max(200, startDelayMs);
    const startTargetPerf = performance.now() + clampedDelay;

    this.phase = "countdown";
    this.runSynchronizedCountdown(startTargetPerf, clampedDelay);
    return parsedChart;
  }

  private runSynchronizedCountdown(startTargetPerf: number, totalDelayMs: number): void {
    if (this.phase !== "countdown") {
      return;
    }

    const remainingMs = startTargetPerf - performance.now();
    if (remainingMs <= 16) {
      this.countdownLabel = "";
      this.phase = "playing";
      this.input.attach();
      this.audio.play(0);
      this.emitSnapshot();
      this.startLoop();
      return;
    }

    const progress = 1 - remainingMs / Math.max(1, totalDelayMs);
    const stepIndex = Math.min(
      COUNTDOWN_STEPS.length - 1,
      Math.max(0, Math.floor(progress * COUNTDOWN_STEPS.length))
    );
    this.countdownLabel = COUNTDOWN_STEPS[stepIndex] ?? "3";
    this.emitSnapshot();
    this.renderFrame();

    this.countdownTimerId = window.setTimeout(() => {
      this.runSynchronizedCountdown(startTargetPerf, totalDelayMs);
    }, 80);
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
        this.pushLaneEffect(missed.lane, "miss");
        this.pvpBridge?.onAutoMiss(missed.index);
      }

      this.renderFrame();
      this.emitSnapshot();

      const lastNote = this.chart?.notes[this.chart.notes.length - 1];
      const lastNoteEnd = (lastNote?.time ?? 0) + (lastNote?.duration ?? 0);
      const finishTime = Math.max(
        this.audio.getDuration(),
        lastNoteEnd + SONG_END_TAIL_SEC
      );

      if (this.notes.areAllNotesJudged() && currentTime >= lastNoteEnd + SONG_END_TAIL_SEC) {
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
    this.activeLanes = [false, false, false, false];
    if (this.pvpBridge) {
      this.pvpBridge.onSongFinished();
    }
    this.phase = "result";
    this.emitSnapshot();
  }

  pause(): void {
    if (this.phase !== "playing" || this.pvpBridge) {
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
    this.pvpBridge?.onNoteAttempt(lane, currentTime);

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
        this.pushLaneEffect(lane, "hit");
      } else {
        this.pushLaneEffect(lane, "miss");
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
    if (this.phase === "playing") {
      const currentTime = this.audio.getCurrentTime();
      const completed = this.notes.releaseHold(lane, currentTime);
      if (completed) {
        this.pushLaneEffect(lane, "hit");
      }
    }
    this.renderFrame();
  }

  private pushLaneEffect(lane: number, kind: "hit" | "miss"): void {
    this.laneEffects.push({
      lane,
      kind,
      createdAt: performance.now(),
      durationMs: kind === "hit" ? 240 : 280
    });
  }

  private drawArrowShape(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
    rotationDeg: number,
    fillStyle: string,
    strokeStyle: string,
    lineWidth: number,
    innerAccent?: string
  ): void {
    const half = size * 0.43;
    const shaftHalf = size * 0.16;
    const headBaseX = -size * 0.04;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationDeg * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(-half, 0);
    ctx.lineTo(headBaseX, -half);
    ctx.lineTo(headBaseX, -shaftHalf);
    ctx.lineTo(half, -shaftHalf);
    ctx.lineTo(half, shaftHalf);
    ctx.lineTo(headBaseX, shaftHalf);
    ctx.lineTo(headBaseX, half);
    ctx.closePath();

    ctx.lineJoin = "round";
    ctx.fillStyle = fillStyle;
    ctx.fill();

    if (innerAccent) {
      ctx.save();
      ctx.scale(0.68, 0.68);
      ctx.fillStyle = innerAccent;
      ctx.fill();
      ctx.restore();
    }

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.restore();
  }

  private drawHoldSustain(
    ctx: CanvasRenderingContext2D,
    note: NoteObject,
    centerX: number,
    laneColor: string,
    laneDark: string
  ): void {
    const durationSec = note.duration ?? 0;
    if (durationSec <= 0) {
      return;
    }

    // Bottom-to-top: head sits at top (clamped to HIT_ZONE_Y while holding), sustain tail extends downward.
    const sustainLength = durationSec * this.scrollSpeed;
    const headY = note.status === "holding" ? Math.max(HIT_ZONE_Y, note.y) : note.y;
    const tailEndY = note.y + sustainLength;
    const visibleHeight = tailEndY - headY;
    if (visibleHeight <= 2) {
      return;
    }

    const bodyWidth = NOTE_WIDTH * 0.34;
    const bodyX = centerX - bodyWidth / 2;

    ctx.save();
    ctx.fillStyle = laneDark;
    ctx.globalAlpha = note.status === "holding" ? 0.92 : 0.72;
    ctx.fillRect(bodyX, headY, bodyWidth, visibleHeight);

    const innerWidth = bodyWidth * 0.45;
    ctx.fillStyle = laneColor;
    ctx.fillRect(centerX - innerWidth / 2, headY, innerWidth, visibleHeight);

    ctx.strokeStyle = "#090B10";
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX, headY, bodyWidth, visibleHeight);

    ctx.beginPath();
    ctx.arc(centerX, tailEndY, bodyWidth / 2, 0, Math.PI);
    ctx.fillStyle = laneColor;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawLaneEffects(ctx: CanvasRenderingContext2D, laneWidth: number): void {
    const now = performance.now();
    this.laneEffects = this.laneEffects.filter((effect) => now - effect.createdAt < effect.durationMs);

    for (const effect of this.laneEffects) {
      const laneDef = LANE_CONFIG[effect.lane];
      if (!laneDef) {
        continue;
      }
      const progress = Math.min(1, (now - effect.createdAt) / effect.durationMs);
      const alpha = 1 - progress;
      const centerX = effect.lane * laneWidth + laneWidth / 2;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (effect.kind === "hit") {
        const radius = NOTE_WIDTH * (0.45 + progress * 0.45);
        ctx.strokeStyle = laneDef.color;
        ctx.lineWidth = 4 * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(centerX, HIT_ZONE_Y, radius, 0, Math.PI * 2);
        ctx.stroke();

        const sparkDist = NOTE_WIDTH * (0.38 + progress * 0.42);
        ctx.fillStyle = "#F8FAFC";
        for (let i = 0; i < 4; i += 1) {
          const angle = Math.PI / 4 + (i * Math.PI) / 2;
          const sx = centerX + Math.cos(angle) * sparkDist;
          const sy = HIT_ZONE_Y + Math.sin(angle) * sparkDist;
          ctx.fillRect(sx - 3, sy - 3, 6, 6);
        }
      } else {
        const crossSize = 18 + progress * 6;
        ctx.strokeStyle = "#FB7185";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX - crossSize, HIT_ZONE_Y - crossSize);
        ctx.lineTo(centerX + crossSize, HIT_ZONE_Y + crossSize);
        ctx.moveTo(centerX + crossSize, HIT_ZONE_Y - crossSize);
        ctx.lineTo(centerX - crossSize, HIT_ZONE_Y + crossSize);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderFrame(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#0B0D14";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const laneWidth = CANVAS_WIDTH / LANE_COUNT;

    for (const laneDef of LANE_CONFIG) {
      const lane = laneDef.index;
      const x = lane * laneWidth;

      if (this.activeLanes[lane]) {
        ctx.fillStyle = laneDef.activeBgTint;
        ctx.fillRect(x, 0, laneWidth, CANVAS_HEIGHT);
      } else if (lane % 2 === 1) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        ctx.fillRect(x, 0, laneWidth, CANVAS_HEIGHT);
      }

      if (lane > 0) {
        ctx.strokeStyle = "#1E2436";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
    }

    // Receptor guide line near top of highway.
    ctx.strokeStyle = "#2E364F";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, HIT_ZONE_Y);
    ctx.lineTo(CANVAS_WIDTH, HIT_ZONE_Y);
    ctx.stroke();

    for (const laneDef of LANE_CONFIG) {
      const lane = laneDef.index;
      const centerX = lane * laneWidth + laneWidth / 2;
      const isActive = this.activeLanes[lane] ?? false;
      const receptorSize = isActive ? NOTE_WIDTH * 0.94 : NOTE_WIDTH;

      const mapping = NOTE_ATLAS_MAP[lane];
      const atlas = this.fnfAssets?.noteAtlas;
      const image = this.fnfAssets?.noteAtlasImage;
      const receptorFrame = atlas && mapping
        ? (isActive
            ? getAtlasFrame(atlas, mapping.confirmPrefix, 0) ?? getAtlasFrame(atlas, mapping.pressPrefix, 0)
            : getAtlasFrame(atlas, mapping.staticPrefix, 0))
        : undefined;

      if (receptorFrame && image) {
        drawAtlasFrame(
          ctx,
          image,
          receptorFrame,
          centerX,
          HIT_ZONE_Y,
          receptorSize,
          receptorSize,
          isActive ? 0 : laneDef.rotationDeg
        );
      } else {
        this.drawArrowShape(
          ctx,
          centerX,
          HIT_ZONE_Y,
          receptorSize,
          laneDef.rotationDeg,
          isActive ? laneDef.darkColor : "#141824",
          isActive ? laneDef.color : "#475569",
          isActive ? 4 : 3,
          isActive ? laneDef.color : undefined
        );
      }
    }

    const visibleNotes = this.notes.getVisibleNotes(CANVAS_HEIGHT, this.scrollSpeed);
    for (const note of visibleNotes) {
      const laneDef = LANE_CONFIG[note.lane];
      if (!laneDef) {
        continue;
      }
      const centerX = note.lane * laneWidth + laneWidth / 2;
      this.drawHoldSustain(ctx, note, centerX, laneDef.color, laneDef.darkColor);
    }

    for (const note of visibleNotes) {
      const laneDef = LANE_CONFIG[note.lane];
      if (!laneDef) {
        continue;
      }
      const centerX = note.lane * laneWidth + laneWidth / 2;
      const headY = note.status === "holding" ? HIT_ZONE_Y : note.y;

      const mapping = NOTE_ATLAS_MAP[note.lane];
      const atlas = this.fnfAssets?.noteAtlas;
      const image = this.fnfAssets?.noteAtlasImage;
      const noteFrame = atlas && mapping
        ? getAtlasFrame(atlas, mapping.notePrefix, 0)
        : undefined;

      if (noteFrame && image) {
        drawAtlasFrame(
          ctx,
          image,
          noteFrame,
          centerX,
          headY,
          NOTE_WIDTH,
          NOTE_HEIGHT,
          0
        );
      } else {
        this.drawArrowShape(
          ctx,
          centerX,
          headY,
          NOTE_WIDTH,
          laneDef.rotationDeg,
          laneDef.color,
          "#090B10",
          3.5,
          "rgba(255, 255, 255, 0.30)"
        );
      }
    }

    this.drawLaneEffects(ctx, laneWidth);
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
