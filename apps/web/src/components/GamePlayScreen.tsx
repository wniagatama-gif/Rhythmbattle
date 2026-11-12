import { useEffect } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, LANE_KEY_NAMES, LANE_LABELS } from "../game/constants";
import type { ChartFile } from "../game/types/chart";
import type { GameSnapshot, JudgementType } from "../game/types/game";
import { CountdownOverlay } from "./CountdownOverlay";

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

const JUDGEMENT_COLORS: Record<JudgementType, string> = {
  PERFECT: "text-[#34D399]",
  GREAT: "text-[#FBBF24]",
  GOOD: "text-[#38BDF8]",
  MISS: "text-[#FB7185]"
};

function getMultiplierLabel(combo: number): string {
  if (combo >= 50) return "4x";
  if (combo >= 25) return "3x";
  if (combo >= 10) return "2x";
  return "1x";
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

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section aria-label="Gameplay stage" className="max-w-xl w-full mx-auto space-y-4">
      {/* Top Bar: Track Info + Pause */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#F3F4F6] truncate">{chart.title}</h2>
          <p className="text-xs text-[#A8B0BF] tabular-nums">
            {chart.bpm} BPM | {scoreState.judgedNotes}/{scoreState.totalNotes} notes
          </p>
        </div>

        <button
          type="button"
          onClick={phase === "paused" ? onResume : onPause}
          disabled={phase === "countdown"}
          className="min-h-[44px] min-w-[84px] px-4 py-2 rounded-md bg-[#181B22] border border-[#64748B] text-sm font-medium text-[#F3F4F6] hover:bg-[#20242E] disabled:opacity-50 shrink-0"
        >
          {phase === "paused" ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Song Progress Bar */}
      <div
        role="progressbar"
        aria-label="Track progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPct)}
        className="w-full h-1.5 bg-[#181B22] rounded-sm overflow-hidden border border-[#2E3442]"
      >
        <div
          className="h-full bg-[#F43F5E]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Stage Container with HUD */}
      <div className="relative rounded-lg border border-[#64748B] bg-[#111318] overflow-hidden">
        {/* HUD Overlay: Accuracy (top-left), Score (top-right), Combo & Judgement (center) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-4 flex items-start justify-between z-10">
          <div className="bg-[#181B22]/90 border border-[#64748B] rounded-md px-3 py-1.5">
            <div className="text-[11px] font-medium text-[#A8B0BF] uppercase">Accuracy</div>
            <div className="text-lg font-bold text-[#F3F4F6] tabular-nums">
              {scoreState.accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="bg-[#181B22]/90 border border-[#64748B] rounded-md px-3 py-1.5 text-right">
            <div className="text-[11px] font-medium text-[#A8B0BF] uppercase">
              Score ({getMultiplierLabel(scoreState.combo)})
            </div>
            <div className="text-lg font-bold text-[#F3F4F6] tabular-nums">
              {scoreState.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Center Combo & Judgement Pop-up */}
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center text-center z-10">
          {scoreState.combo > 0 && (
            <div className="mb-2">
              <div className="text-4xl font-extrabold text-[#F3F4F6] tabular-nums leading-none">
                {scoreState.combo}
              </div>
              <div className="text-xs font-semibold uppercase text-[#A8B0BF] mt-1">
                Combo
              </div>
            </div>
          )}

          {lastJudgement && (
            <div
              key={lastJudgement.timestamp}
              className="animate-judgement-pop px-3 py-1 rounded bg-[#181B22]/90 border border-[#2E3442]"
            >
              <div className={`text-xl font-bold tracking-wide ${JUDGEMENT_COLORS[lastJudgement.type]}`}>
                {lastJudgement.type}
              </div>
              <div className="text-xs text-[#A8B0BF] tabular-nums">
                {lastJudgement.timingDeltaMs >= 0 ? "+" : ""}
                {Math.round(lastJudgement.timingDeltaMs)} ms
              </div>
            </div>
          )}
        </div>

        {/* HTML Canvas 2D Stage */}
        <canvas
          ref={setCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="Rhythm game note highway"
          className="block w-full max-w-[440px] mx-auto h-auto aspect-[440/640]"
        />

        {phase === "countdown" && (
          <CountdownOverlay
            label={countdownLabel}
            trackTitle={chart.title}
            onCancel={onExit}
          />
        )}

        {phase === "paused" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-dialog-title"
            className="absolute inset-0 bg-[#111318]/92 flex flex-col items-center justify-center p-6 z-20"
          >
            <div className="w-full max-w-xs p-6 rounded-lg bg-[#181B22] border border-[#64748B] space-y-4 text-center">
              <h3 id="pause-dialog-title" className="text-xl font-semibold text-[#F3F4F6]">
                Track Paused
              </h3>
              <p className="text-sm text-[#A8B0BF]">
                Press Escape or choose an action below.
              </p>
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={onResume}
                  className="w-full min-h-[44px] px-4 py-2 rounded-md bg-[#BE123C] hover:bg-[#9F1239] text-white font-semibold text-sm"
                >
                  Resume Track
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="w-full min-h-[44px] px-4 py-2 rounded-md bg-[#111318] border border-[#64748B] text-[#F3F4F6] hover:bg-[#20242E] font-medium text-sm"
                >
                  Restart Track
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full min-h-[44px] px-4 py-2 rounded-md bg-[#111318] border border-[#64748B] text-[#A8B0BF] hover:text-[#F3F4F6] hover:bg-[#20242E] font-medium text-sm"
                >
                  Back to Song List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Touch & Pointer Input Pads (Mobile + Mouse Fallback) */}
      <div className="grid grid-cols-4 gap-3" aria-label="Touch lane controls">
        {LANE_LABELS.map((symbol, lane) => {
          const isActive = activeLanes[lane] ?? false;
          return (
            <button
              key={symbol}
              type="button"
              aria-label={`Lane ${LANE_KEY_NAMES[lane]}`}
              onPointerDown={(e) => {
                e.preventDefault();
                onLanePress(lane);
              }}
              onPointerUp={() => onLaneRelease(lane)}
              onPointerLeave={() => onLaneRelease(lane)}
              onPointerCancel={() => onLaneRelease(lane)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!e.repeat) {
                    onLanePress(lane);
                  }
                }
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLaneRelease(lane);
                }
              }}
              className={`min-h-[52px] rounded-md border text-lg font-bold select-none touch-manipulation transition-colors ${
                isActive
                  ? "bg-[#BE123C] border-[#F43F5E] text-white"
                  : "bg-[#181B22] border-[#64748B] text-[#F3F4F6] hover:bg-[#20242E]"
              }`}
            >
              {symbol}
            </button>
          );
        })}
      </div>
    </section>
  );
}

