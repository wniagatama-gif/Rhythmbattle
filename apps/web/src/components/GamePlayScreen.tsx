import { useEffect, useMemo, useRef, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, LANE_CONFIG } from "../game/constants";
import type { ChartFile } from "../game/types/chart";
import type { CharacterAnimState, GameSnapshot, JudgementResult, JudgementType } from "../game/types/game";
import { CountdownOverlay } from "./CountdownOverlay";
import { BattleCharacter } from "./characters/BattleCharacter";
import { BattleHealthBar } from "./stage/BattleHealthBar";

interface GamePlayScreenProps {
  chart: ChartFile;
  snapshot: GameSnapshot;
  setCanvasRef: (node: HTMLCanvasElement | null) => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  onLanePress: (lane: number) => void;
  onLaneRelease: (lane: number) => void;
}

interface FeedbackDisplay {
  headline: "SICK!" | "GOOD!" | "BAD" | "SHIT" | "MISS";
  colorClass: string;
}

function getExpressiveFeedback(judgement: JudgementResult): FeedbackDisplay {
  switch (judgement.type) {
    case "PERFECT":
      return { headline: "SICK!", colorClass: "text-[#FBBF24]" };
    case "GREAT":
      return { headline: "GOOD!", colorClass: "text-[#34D399]" };
    case "GOOD":
      return { headline: "BAD", colorClass: "text-[#38BDF8]" };
    case "MISS": {
      const absMs = Math.abs(judgement.timingDeltaMs);
      if (absMs > 135 && absMs <= 180) {
        return { headline: "SHIT", colorClass: "text-[#FB7185]" };
      }
      return { headline: "MISS", colorClass: "text-[#FB7185]" };
    }
  }
}

const LANE_SING_STATES: readonly CharacterAnimState[] = [
  "singLeft",
  "singDown",
  "singUp",
  "singRight"
];

function getMultiplierLabel(combo: number): string {
  if (combo >= 50) return "4x";
  if (combo >= 25) return "3x";
  if (combo >= 10) return "2x";
  return "1x";
}

function getVisualHealthMeters(counts: Record<JudgementType, number>): {
  playerHp: number;
  opponentHp: number;
} {
  // Visual-only battle momentum for Phase 2 before Phase 3 Combat System provides real HP.
  const positiveMomentum = counts.PERFECT * 3 + counts.GREAT * 2 + counts.GOOD;
  const negativeMomentum = counts.MISS * 7;
  const shift = Math.max(-38, Math.min(38, positiveMomentum * 0.8 - negativeMomentum));
  const playerHp = Math.round(Math.max(12, Math.min(100, 62 + shift)));
  const opponentHp = Math.round(Math.max(12, Math.min(100, 62 - shift)));
  return { playerHp, opponentHp };
}

export function GamePlayScreen({
  chart,
  snapshot,
  setCanvasRef,
  onPause,
  onResume,
  onRestart,
  onExit,
  onLanePress,
  onLaneRelease
}: GamePlayScreenProps) {
  const { phase, scoreState, lastJudgement, countdownLabel, currentTime, duration, activeLanes } =
    snapshot;

  const [playerReaction, setPlayerReaction] = useState<CharacterAnimState>("idle");
  const [opponentReaction, setOpponentReaction] = useState<CharacterAnimState>("idle");
  const reactionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }
      if (phase === "playing") {
        onPause();
      } else if (phase === "paused") {
        onResume();
      } else if (phase === "countdown") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [phase, onPause, onResume, onExit]);

  useEffect(() => {
    if (!lastJudgement) {
      setPlayerReaction("idle");
      setOpponentReaction("idle");
      return;
    }

    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
    }

    if (lastJudgement.type === "MISS") {
      setPlayerReaction("hurt");
      setOpponentReaction("singUp");
    } else if (scoreState.combo > 0 && scoreState.combo % 10 === 0) {
      setPlayerReaction("special");
      setOpponentReaction("hurt");
    } else {
      setPlayerReaction(LANE_SING_STATES[lastJudgement.lane] ?? "idle");
      setOpponentReaction("idle");
    }

    reactionTimerRef.current = window.setTimeout(() => {
      setPlayerReaction("idle");
      setOpponentReaction("idle");
    }, 240);

    return () => {
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, [lastJudgement, scoreState.combo]);

  const activePressedLaneIndex = activeLanes.findIndex(Boolean);
  const playerState: CharacterAnimState =
    activePressedLaneIndex >= 0
      ? (LANE_SING_STATES[activePressedLaneIndex] ?? playerReaction)
      : playerReaction;

  const beatPhase = Math.floor((currentTime * chart.bpm) / 60);
  const opponentState: CharacterAnimState =
    opponentReaction !== "idle"
      ? opponentReaction
      : phase === "playing" && beatPhase % 8 === 4
      ? "singDown"
      : "idle";

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const { playerHp, opponentHp } = useMemo(
    () => getVisualHealthMeters(scoreState.counts),
    [scoreState.counts]
  );

  const feedback = lastJudgement ? getExpressiveFeedback(lastJudgement) : null;

  return (
    <section
      aria-label="Gameplay stage"
      className="relative h-dvh w-full overflow-hidden bg-[#0B0D14] text-[#F8FAFC] flex flex-col select-none"
    >
      {/* Subtle Arcade Stage Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[34%] bg-[#141824] border-t-4 border-[#090B10]"
        />
        <div
          className="hidden md:block absolute left-6 bottom-[34%] w-40 h-44 rounded-t-xl bg-[#111521] border-2 border-[#1E2436]"
        />
        <div
          className="hidden md:block absolute right-6 bottom-[34%] w-40 h-44 rounded-t-xl bg-[#111521] border-2 border-[#1E2436]"
        />
      </div>

      {/* Integrated Top HUD & Battle Health Bar */}
      <header className="relative z-10 shrink-0 px-3 sm:px-6 pt-2.5 pb-2 border-b-2 border-[#090B10] bg-[#141824]">
        <div className="max-w-7xl mx-auto grid grid-cols-12 items-center gap-2 sm:gap-4">
          {/* Track Identity & Progress */}
          <div className="col-span-5 md:col-span-3 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-[#F8FAFC] truncate">
                {chart.title}
              </h2>
              <span className="shrink-0 px-1.5 py-0.5 rounded border border-[#090B10] bg-[#1E2436] text-[10px] font-bold uppercase text-[#FBBF24]">
                {chart.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#CBD5E1] tabular-nums mt-0.5">
              <span>{chart.bpm} BPM</span>
              <span>/</span>
              <span>
                {scoreState.judgedNotes}/{scoreState.totalNotes}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Track progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPct)}
              className="mt-1.5 h-1.5 w-full rounded-sm bg-[#0B0D14] border border-[#090B10] overflow-hidden"
            >
              <div
                className="h-full bg-[#F59E0B] transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Center Battle Health Bar */}
          <div className="col-span-12 md:col-span-6 order-3 md:order-2">
            <BattleHealthBar
              playerName="Challenger"
              opponentName={chart.artist}
              playerHp={playerHp}
              opponentHp={opponentHp}
              maxHp={100}
            />
          </div>

          {/* Integrated Score, Accuracy & Pause */}
          <div className="col-span-7 md:col-span-3 order-2 md:order-3 flex items-center justify-end gap-2 sm:gap-3">
            <div className="text-right tabular-nums leading-tight">
              <div className="text-[11px] font-bold uppercase text-[#CBD5E1]">
                Score {getMultiplierLabel(scoreState.combo)} | {scoreState.accuracy.toFixed(1)}%
              </div>
              <div className="text-base sm:text-lg font-black text-[#F8FAFC]">
                {scoreState.score.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-[#CBD5E1]">
                Max Combo {scoreState.maxCombo}
              </div>
            </div>

            <button
              type="button"
              onClick={phase === "paused" ? onResume : onPause}
              disabled={phase === "countdown"}
              className="min-h-[44px] min-w-[76px] px-3.5 py-2 rounded-md bg-[#1E2436] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs sm:text-sm font-extrabold uppercase text-[#F8FAFC] hover:bg-[#2A334B] disabled:opacity-50 shrink-0"
            >
              {phase === "paused" ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Side-View Battle Stage */}
      <div className="relative z-10 flex-1 min-h-0 max-w-7xl w-full mx-auto px-2 sm:px-6 py-2 grid grid-cols-1 md:grid-cols-12 items-stretch gap-2">
        {/* Player Side (Left, Facing Right) */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col items-center justify-end pb-6">
          <BattleCharacter
            role="player"
            name="Challenger"
            title="Player"
            state={playerState}
            facing="right"
            beatPhase={beatPhase}
          />
        </div>

        {/* Center 4-Lane Rhythm Highway */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col items-center justify-between min-h-0 h-full gap-2">
          {/* Mobile Compact Character Row */}
          <div className="flex md:hidden w-full items-center justify-between px-1 shrink-0">
            <span className="px-2 py-1 rounded border-2 border-[#090B10] bg-[#141824] text-[11px] font-extrabold text-[#FB7185]">
              YOU ({playerState})
            </span>
            <span className="px-2 py-1 rounded border-2 border-[#090B10] bg-[#141824] text-[11px] font-extrabold text-[#38BDF8] truncate max-w-[160px]">
              {chart.artist}
            </span>
          </div>

          {/* Highway Frame */}
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
            <div className="relative h-full max-h-full aspect-[520/740] max-w-full rounded-xl border-[3px] border-[#090B10] bg-[#0B0D14] shadow-[0_8px_0_#05070B] overflow-hidden">
              {/* Top-center Combo & Expressive Judgment Feedback (Positioned high above receptors so notes stay clear) */}
              <div className="pointer-events-none absolute inset-x-0 top-3 px-3 flex items-start justify-between z-10">
                <div className="min-w-[84px]">
                  {feedback && lastJudgement && (
                    <div
                      key={lastJudgement.timestamp}
                      className="animate-judgement-pop inline-block px-2.5 py-1 rounded-md bg-[#141824]/95 border-2 border-[#090B10] shadow-[0_3px_0_#05070B]"
                    >
                      <div className={`text-lg sm:text-xl font-black tracking-tight leading-none ${feedback.colorClass}`}>
                        {feedback.headline}
                      </div>
                      <div className="text-[11px] font-bold text-[#CBD5E1] tabular-nums mt-0.5">
                        {lastJudgement.timingDeltaMs >= 0 ? "+" : ""}
                        {Math.round(lastJudgement.timingDeltaMs)} ms
                      </div>
                    </div>
                  )}
                </div>

                {scoreState.combo > 0 && (
                  <div className="px-3 py-1 rounded-md bg-[#141824]/95 border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-right">
                    <div className="text-2xl sm:text-3xl font-black text-[#FBBF24] tabular-nums leading-none">
                      {scoreState.combo}
                    </div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#F8FAFC]">
                      Combo
                    </div>
                  </div>
                )}
              </div>

              {/* Rhythm Engine Canvas */}
              <canvas
                ref={setCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                aria-label="Rhythm game note highway"
                className="block w-full h-full"
              />
            </div>
          </div>

          {/* Interactive Lane Controls (Always LEFT -> DOWN -> UP -> RIGHT) */}
          <div
            className="w-full max-w-[440px] grid grid-cols-4 gap-2 shrink-0"
            aria-label="Touch and pointer lane controls"
          >
            {LANE_CONFIG.map((laneDef) => {
              const isActive = activeLanes[laneDef.index] ?? false;
              return (
                <button
                  key={laneDef.id}
                  type="button"
                  aria-label={`Lane ${laneDef.direction}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onLanePress(laneDef.index);
                  }}
                  onPointerUp={() => onLaneRelease(laneDef.index)}
                  onPointerLeave={() => onLaneRelease(laneDef.index)}
                  onPointerCancel={() => onLaneRelease(laneDef.index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!e.repeat) {
                        onLanePress(laneDef.index);
                      }
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onLaneRelease(laneDef.index);
                    }
                  }}
                  style={{
                    backgroundColor: isActive ? laneDef.color : "#141824",
                    color: isActive ? laneDef.textColorOnFill : laneDef.textColorOnDark
                  }}
                  className="min-h-[44px] py-1.5 rounded-md border-2 border-[#090B10] shadow-[0_3px_0_#05070B] flex items-center justify-center gap-1.5 font-extrabold text-sm touch-manipulation transition-transform active:translate-y-0.5"
                >
                  <span className="text-base leading-none">{laneDef.symbol}</span>
                  <span className="text-[11px] tracking-wide">{laneDef.direction}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opponent Side (Right, Facing Left) */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col items-center justify-end pb-6">
          <BattleCharacter
            role="opponent"
            name={chart.artist}
            title="Opponent"
            state={opponentState}
            facing="left"
            beatPhase={beatPhase}
          />
        </div>
      </div>

      {/* Countdown Overlay */}
      {phase === "countdown" && (
        <CountdownOverlay
          label={countdownLabel}
          trackTitle={chart.title}
          onCancel={onExit}
        />
      )}

      {/* Pause Overlay (Does not shift underlying stage layout) */}
      {phase === "paused" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-dialog-title"
          className="absolute inset-0 bg-[#0B0D14]/88 flex items-center justify-center p-4 z-30"
        >
          <div className="w-full max-w-xs p-6 rounded-xl bg-[#141824] border-[3px] border-[#090B10] shadow-[0_8px_0_#05070B] space-y-4 text-center">
            <h3 id="pause-dialog-title" className="text-2xl font-black text-[#F8FAFC] uppercase tracking-tight">
              Paused
            </h3>
            <p className="text-sm text-[#CBD5E1]">
              Press Escape to resume, or pick an action below.
            </p>
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={onResume}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-white font-extrabold text-sm uppercase"
              >
                Resume Battle
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-[#F8FAFC] font-bold text-sm uppercase"
              >
                Restart Track
              </button>
              <button
                type="button"
                onClick={onExit}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-[#0B0D14] hover:bg-[#1E2436] border-2 border-[#090B10] text-[#CBD5E1] hover:text-[#F8FAFC] font-bold text-sm uppercase"
              >
                Exit to Song Select
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
