import { useEffect, useMemo, useRef, useState } from "react";
import {
  PVP_COMBAT_CONFIG,
  type PvpPlayerSnapshot
} from "@rhythm-battle/shared";
import { CANVAS_HEIGHT, CANVAS_WIDTH, LANE_CONFIG } from "../game/constants";
import type { ChartFile } from "../game/types/chart";
import type {
  CharacterAnimState,
  GameSnapshot,
  JudgementResult,
  JudgementType
} from "../game/types/game";
import type { PvpCombatPulse } from "../hooks/usePvpMatch";
import { CountdownOverlay } from "./CountdownOverlay";
import { BattleCharacter } from "./characters/BattleCharacter";
import { BattleHealthBar } from "./stage/BattleHealthBar";

export interface GamePlayPvpContext {
  selfPlayer: PvpPlayerSnapshot | null;
  opponentPlayer: PvpPlayerSnapshot | null;
  pingMs: number | null;
  isSpecialReady: boolean;
  combatPulse: PvpCombatPulse | null;
  onSpecialAttack: () => void;
}

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
  pvpContext?: GamePlayPvpContext;
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
  onLaneRelease,
  pvpContext
}: GamePlayScreenProps) {
  const { phase, scoreState, lastJudgement, countdownLabel, currentTime, duration, activeLanes } =
    snapshot;

  const isPvp = Boolean(pvpContext);
  const [playerReaction, setPlayerReaction] = useState<CharacterAnimState>("idle");
  const [opponentReaction, setOpponentReaction] = useState<CharacterAnimState>("idle");
  const [specialFlashSide, setSpecialFlashSide] = useState<"player" | "opponent" | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const opponentTimerRef = useRef<number | null>(null);
  const specialTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        if (isPvp) {
          return;
        }
        if (phase === "playing") {
          onPause();
        } else if (phase === "paused") {
          onResume();
        } else if (phase === "countdown") {
          onExit();
        }
        return;
      }

      if (event.code === "Space" && isPvp && phase === "playing" && pvpContext?.isSpecialReady) {
        event.preventDefault();
        if (!event.repeat) {
          pvpContext.onSpecialAttack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, isPvp, pvpContext, onPause, onResume, onExit]);

  useEffect(() => {
    if (!lastJudgement) {
      setPlayerReaction("idle");
      if (!isPvp) {
        setOpponentReaction("idle");
      }
      return;
    }

    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
    }

    if (lastJudgement.type === "MISS") {
      setPlayerReaction("miss");
      if (!isPvp) {
        setOpponentReaction("singUp");
      }
    } else if (scoreState.combo > 0 && scoreState.combo % 10 === 0) {
      setPlayerReaction("special");
      if (!isPvp) {
        setOpponentReaction("hurt");
      }
    } else {
      setPlayerReaction(LANE_SING_STATES[lastJudgement.lane] ?? "idle");
      if (!isPvp) {
        setOpponentReaction("idle");
      }
    }

    reactionTimerRef.current = window.setTimeout(() => {
      setPlayerReaction("idle");
      if (!isPvp) {
        setOpponentReaction("idle");
      }
    }, 240);

    return () => {
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, [lastJudgement, scoreState.combo, isPvp]);

  // Drive remote opponent & Special Attack animations from server PvP events.
  useEffect(() => {
    const pulse = pvpContext?.combatPulse;
    if (!pulse || !pvpContext) {
      return;
    }

    const selfId = pvpContext.selfPlayer?.playerId;
    const isSelfActor = pulse.actorId === selfId;

    if (pulse.kind === "special") {
      if (specialTimerRef.current !== null) {
        window.clearTimeout(specialTimerRef.current);
      }
      setSpecialFlashSide(isSelfActor ? "player" : "opponent");
      if (isSelfActor) {
        setPlayerReaction("special");
        setOpponentReaction("hurt");
      } else {
        setOpponentReaction("special");
        setPlayerReaction("hurt");
      }
      specialTimerRef.current = window.setTimeout(() => {
        setSpecialFlashSide(null);
      }, 420);
      return;
    }

    if (!isSelfActor) {
      if (opponentTimerRef.current !== null) {
        window.clearTimeout(opponentTimerRef.current);
      }
      if (pulse.kind === "miss") {
        setOpponentReaction("miss");
      } else if (pulse.kind === "hit" && pulse.lane !== undefined) {
        setOpponentReaction(LANE_SING_STATES[pulse.lane] ?? "singUp");
      }
      opponentTimerRef.current = window.setTimeout(() => {
        setOpponentReaction("idle");
      }, 240);
    }
  }, [pvpContext]);

  const activePressedLaneIndex = activeLanes.findIndex(Boolean);
  const playerState: CharacterAnimState =
    activePressedLaneIndex >= 0
      ? (LANE_SING_STATES[activePressedLaneIndex] ?? playerReaction)
      : playerReaction;

  const beatPhase = Math.floor((currentTime * chart.bpm) / 60);
  const isBeatPulse = beatPhase % 2 === 0;
  const opponentState: CharacterAnimState =
    opponentReaction !== "idle"
      ? opponentReaction
      : !isPvp && phase === "playing" && beatPhase % 8 === 4
      ? "singDown"
      : "idle";

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const displayScore = pvpContext?.selfPlayer?.score ?? scoreState.score;
  const displayCombo = pvpContext?.selfPlayer?.combo ?? scoreState.combo;
  const displayMaxCombo = pvpContext?.selfPlayer?.maxCombo ?? scoreState.maxCombo;
  const displayAccuracy = pvpContext?.selfPlayer?.accuracy ?? scoreState.accuracy;

  const { playerHp, opponentHp } = useMemo(() => {
    if (pvpContext?.selfPlayer && pvpContext?.opponentPlayer) {
      return {
        playerHp: pvpContext.selfPlayer.hp,
        opponentHp: pvpContext.opponentPlayer.hp
      };
    }
    return getVisualHealthMeters(scoreState.counts);
  }, [pvpContext?.selfPlayer, pvpContext?.opponentPlayer, scoreState.counts]);

  const feedback = lastJudgement ? getExpressiveFeedback(lastJudgement) : null;
  const specialProgressPct = Math.min(
    100,
    Math.round((displayCombo / PVP_COMBAT_CONFIG.specialAttack.comboThreshold) * 100)
  );

  return (
    <section
      aria-label="Gameplay stage"
      className="relative h-dvh w-full overflow-hidden bg-[#0B0D14] text-[#F8FAFC] flex flex-col select-none"
    >
      {/* FNF-Inspired Concert Stage Backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Overhead Stage Truss & Spotlights */}
        <div className="absolute inset-x-0 top-14 h-5 bg-[#111522] border-y-2 border-[#090B10]" />
        <div
          className="hidden md:block absolute left-[14%] top-16 w-48 h-72 opacity-20"
          style={{
            background: "linear-gradient(180deg, #E11D48 0%, transparent 100%)",
            clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)"
          }}
        />
        <div
          className="hidden md:block absolute right-[14%] top-16 w-48 h-72 opacity-20"
          style={{
            background: "linear-gradient(180deg, #0284C7 0%, transparent 100%)",
            clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)"
          }}
        />

        {/* Stage Floor */}
        <div className="absolute inset-x-0 bottom-0 h-[33%] bg-[#141824] border-t-4 border-[#090B10]" />

        {/* Left & Right Beat-Synced Speaker Stacks */}
        <div
          className={`hidden md:flex flex-col items-center justify-around p-3 absolute left-6 bottom-[33%] w-36 h-48 rounded-t-xl bg-[#111521] border-2 border-[#090B10] transition-transform duration-100 ${
            isBeatPulse ? "scale-[1.02]" : "scale-100"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#0B0D14] border-4 border-[#334155]" />
          <div className="w-20 h-20 rounded-full bg-[#0B0D14] border-4 border-[#E11D48]" />
        </div>

        <div
          className={`hidden md:flex flex-col items-center justify-around p-3 absolute right-6 bottom-[33%] w-36 h-48 rounded-t-xl bg-[#111521] border-2 border-[#090B10] transition-transform duration-100 ${
            isBeatPulse ? "scale-[1.02]" : "scale-100"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#0B0D14] border-4 border-[#334155]" />
          <div className="w-20 h-20 rounded-full bg-[#0B0D14] border-4 border-[#0284C7]" />
        </div>

        {/* Special Attack Shockwave Overlay */}
        {specialFlashSide && (
          <div
            className={`absolute inset-0 transition-opacity duration-200 ${
              specialFlashSide === "player"
                ? "bg-[#F59E0B]/20 border-4 border-[#F59E0B]"
                : "bg-[#FB7185]/20 border-4 border-[#FB7185]"
            }`}
          />
        )}
      </div>

      {/* Integrated Top HUD & Battle Health Bar */}
      <header className="relative z-10 shrink-0 px-3 sm:px-6 pt-2 pb-2 border-b-2 border-[#090B10] bg-[#141824]">
        <div className="max-w-7xl mx-auto grid grid-cols-12 items-center gap-2 sm:gap-4">
          {/* Track Info & Progress */}
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
              {isPvp && pvpContext?.pingMs !== null && pvpContext?.pingMs !== undefined && (
                <span className="text-[#34D399]">| {pvpContext.pingMs} ms</span>
              )}
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

          {/* Center Battle Health Bar + PvP Dual Comparison */}
          <div className="col-span-12 md:col-span-6 order-3 md:order-2 space-y-1">
            <BattleHealthBar
              playerName={pvpContext?.selfPlayer?.playerName ?? "Challenger"}
              opponentName={pvpContext?.opponentPlayer?.playerName ?? chart.artist}
              playerHp={playerHp}
              opponentHp={opponentHp}
              maxHp={100}
            />
            {isPvp && pvpContext?.opponentPlayer && (
              <div className="flex items-center justify-between text-[11px] font-bold text-[#CBD5E1] tabular-nums px-12">
                <span>
                  Combo {displayCombo} | {displayAccuracy.toFixed(1)}%
                </span>
                <span className="text-[#38BDF8]">
                  Opp: {pvpContext.opponentPlayer.score.toLocaleString()} ({pvpContext.opponentPlayer.accuracy.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          {/* Score, Special Attack / Pause Control */}
          <div className="col-span-7 md:col-span-3 order-2 md:order-3 flex items-center justify-end gap-2 sm:gap-3">
            <div className="text-right tabular-nums leading-tight">
              <div className="text-[11px] font-bold uppercase text-[#CBD5E1]">
                Score {getMultiplierLabel(displayCombo)} | {displayAccuracy.toFixed(1)}%
              </div>
              <div className="text-base sm:text-lg font-black text-[#F8FAFC]">
                {displayScore.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-[#CBD5E1]">
                Max Combo {displayMaxCombo}
              </div>
            </div>

            {isPvp ? (
              <button
                type="button"
                onClick={onExit}
                className="min-h-[44px] px-3 py-2 rounded-md bg-[#1E2436] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs font-extrabold uppercase text-[#FB7185] hover:bg-[#2A334B] shrink-0"
              >
                Leave
              </button>
            ) : (
              <button
                type="button"
                onClick={phase === "paused" ? onResume : onPause}
                disabled={phase === "countdown"}
                className="min-h-[44px] min-w-[76px] px-3.5 py-2 rounded-md bg-[#1E2436] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs sm:text-sm font-extrabold uppercase text-[#F8FAFC] hover:bg-[#2A334B] disabled:opacity-50 shrink-0"
              >
                {phase === "paused" ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Side-View Battle Stage */}
      <div className="relative z-10 flex-1 min-h-0 max-w-7xl w-full mx-auto px-2 sm:px-6 py-2 grid grid-cols-1 md:grid-cols-12 items-stretch gap-2">
        {/* Player 1 Side (Left, Facing Right) */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col items-center justify-end pb-6 gap-3">
          {isPvp && (
            <button
              type="button"
              disabled={!pvpContext?.isSpecialReady || phase !== "playing"}
              onClick={() => pvpContext?.onSpecialAttack()}
              className={`min-h-[44px] px-4 py-2 rounded-lg border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs font-black uppercase transition-colors ${
                pvpContext?.isSpecialReady
                  ? "bg-[#F59E0B] text-[#090B10] hover:bg-[#FBBF24]"
                  : "bg-[#141824] text-[#CBD5E1] opacity-80"
              }`}
            >
              {pvpContext?.isSpecialReady
                ? "SPACE: Special Ready!"
                : `Special Charge ${specialProgressPct}%`}
            </button>
          )}

          <BattleCharacter
            role="player"
            name={pvpContext?.selfPlayer?.playerName ?? "Challenger"}
            title="Player 1"
            state={playerState}
            facing="right"
            beatPhase={beatPhase}
          />
        </div>

        {/* Center 4-Lane Bottom-to-Top Rhythm Highway */}
        <div className="md:col-span-6 lg:col-span-4 flex flex-col items-center justify-between min-h-0 h-full gap-1.5">
          {/* Mobile Compact Status Strip */}
          <div className="flex md:hidden w-full items-center justify-between px-1 shrink-0">
            <span className="px-2 py-1 rounded border-2 border-[#090B10] bg-[#141824] text-[11px] font-extrabold text-[#FB7185]">
              P1 ({playerState})
            </span>
            {isPvp && pvpContext?.isSpecialReady && (
              <button
                type="button"
                onClick={() => pvpContext.onSpecialAttack()}
                className="px-2.5 py-1 rounded border-2 border-[#090B10] bg-[#F59E0B] text-[#090B10] text-[11px] font-black uppercase"
              >
                Special!
              </button>
            )}
            <span className="px-2 py-1 rounded border-2 border-[#090B10] bg-[#141824] text-[11px] font-extrabold text-[#38BDF8] truncate max-w-[140px]">
              {pvpContext?.opponentPlayer?.playerName ?? chart.artist}
            </span>
          </div>

          {/* Dedicated Judgment & Combo Bar Above Receptors (Never obscures rising notes) */}
          <div className="w-full max-w-[440px] h-11 shrink-0 flex items-center justify-between px-3 rounded-lg bg-[#141824] border-2 border-[#090B10] shadow-[0_3px_0_#05070B]">
            <div className="flex items-center gap-2 min-w-0">
              {feedback && lastJudgement ? (
                <div key={lastJudgement.timestamp} className="animate-judgement-pop flex items-baseline gap-2">
                  <span className={`text-lg font-black tracking-tight ${feedback.colorClass}`}>
                    {feedback.headline}
                  </span>
                  <span className="text-xs font-bold text-[#CBD5E1] tabular-nums">
                    {lastJudgement.timingDeltaMs >= 0 ? "+" : ""}
                    {Math.round(lastJudgement.timingDeltaMs)} ms
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Hit notes at top receptors
                </span>
              )}
            </div>

            <div className="text-right tabular-nums">
              {displayCombo > 0 && (
                <span className="text-base font-black text-[#FBBF24]">
                  {displayCombo}x COMBO
                </span>
              )}
            </div>
          </div>

          {/* Highway Canvas Frame */}
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
            <div className="relative h-full max-h-full aspect-[520/740] max-w-full rounded-xl border-[3px] border-[#090B10] bg-[#0B0D14] shadow-[0_8px_0_#05070B] overflow-hidden">
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

        {/* Player 2 / Opponent Side (Right, Facing Left) */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-4 flex-col items-center justify-end pb-6">
          <BattleCharacter
            role="opponent"
            name={pvpContext?.opponentPlayer?.playerName ?? chart.artist}
            title={isPvp ? "Player 2 (Online)" : "Opponent"}
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

      {/* Pause Overlay (Free Play only) */}
      {phase === "paused" && !isPvp && (
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
