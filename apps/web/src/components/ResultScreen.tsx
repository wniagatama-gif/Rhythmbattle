import type { ChartFile } from "../game/types/chart";
import type { ScoreState } from "../game/types/game";
import { BattleCharacter } from "./characters/BattleCharacter";

interface ResultScreenProps {
  chart: ChartFile;
  scoreState: ScoreState;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onBackToList: () => void;
}

export function ResultScreen({
  chart,
  scoreState,
  isNewBest,
  onPlayAgain,
  onBackToList
}: ResultScreenProps) {
  const isVictory = scoreState.accuracy >= 60;

  return (
    <section aria-labelledby="result-heading" className="max-w-4xl w-full mx-auto">
      <div className="p-6 sm:p-8 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_8px_0_#05070B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E2436] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded border border-[#090B10] text-xs font-black uppercase ${
                  isVictory ? "bg-[#34D399] text-[#090B10]" : "bg-[#FB7185] text-[#090B10]"
                }`}
              >
                {isVictory ? "Stage Clear" : "Stage Failed"}
              </span>
              {isNewBest && (
                <span className="px-2.5 py-0.5 rounded border border-[#090B10] bg-[#FBBF24] text-[#090B10] text-xs font-black uppercase">
                  New Best Score
                </span>
              )}
            </div>
            <h2 id="result-heading" className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
              {chart.title}
            </h2>
            <p className="text-sm font-semibold text-[#CBD5E1]">
              vs {chart.artist} | {chart.bpm} BPM | {chart.difficulty.toUpperCase()}
            </p>
          </div>

          <div className="flex justify-center shrink-0">
            <BattleCharacter
              role="player"
              name="Challenger"
              state={isVictory ? "victory" : "defeat"}
              facing="right"
              compact
            />
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
          <div className="p-4 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
            <dt className="text-xs font-bold uppercase text-[#CBD5E1]">Final Score</dt>
            <dd className="text-3xl font-black text-[#F8FAFC] mt-1">
              {scoreState.score.toLocaleString()}
            </dd>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
            <dt className="text-xs font-bold uppercase text-[#CBD5E1]">Accuracy</dt>
            <dd className="text-3xl font-black text-[#34D399] mt-1">
              {scoreState.accuracy.toFixed(1)}%
            </dd>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
            <dt className="text-xs font-bold uppercase text-[#CBD5E1]">Max Combo</dt>
            <dd className="text-3xl font-black text-[#FBBF24] mt-1">
              {scoreState.maxCombo}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#F8FAFC]">
            Judgement Breakdown
          </h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
            <div className="p-3 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
              <dt className="text-xs font-extrabold text-[#FBBF24]">PERFECT (SICK)</dt>
              <dd className="text-xl font-black text-[#F8FAFC] mt-1">
                {scoreState.counts.PERFECT}
              </dd>
            </div>
            <div className="p-3 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
              <dt className="text-xs font-extrabold text-[#34D399]">GREAT (GOOD)</dt>
              <dd className="text-xl font-black text-[#F8FAFC] mt-1">
                {scoreState.counts.GREAT}
              </dd>
            </div>
            <div className="p-3 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
              <dt className="text-xs font-extrabold text-[#38BDF8]">GOOD (BAD)</dt>
              <dd className="text-xl font-black text-[#F8FAFC] mt-1">
                {scoreState.counts.GOOD}
              </dd>
            </div>
            <div className="p-3 rounded-lg bg-[#0B0D14] border-2 border-[#090B10]">
              <dt className="text-xs font-extrabold text-[#FB7185]">MISS</dt>
              <dd className="text-xl font-black text-[#F8FAFC] mt-1">
                {scoreState.counts.MISS}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-white font-black uppercase text-sm transition-colors"
          >
            Replay Battle
          </button>
          <button
            type="button"
            onClick={onBackToList}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-[#F8FAFC] font-extrabold uppercase text-sm transition-colors"
          >
            Back to Stage Select
          </button>
        </div>
      </div>
    </section>
  );
}
