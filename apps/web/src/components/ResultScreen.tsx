import type { ChartFile } from "../game/types/chart";
import type { ScoreState } from "../game/types/game";

interface ResultScreenProps {
  chart: ChartFile;
  scoreState: ScoreState;
  onPlayAgain: () => void;
  onBackToList: () => void;
}

export function ResultScreen({
  chart,
  scoreState,
  onPlayAgain,
  onBackToList
}: ResultScreenProps) {
  return (
    <section aria-labelledby="result-heading" className="max-w-2xl w-full mx-auto">
      <div className="p-6 sm:p-8 rounded-lg bg-[#181B22] border border-[#64748B] space-y-6">
        <div className="space-y-1 border-b border-[#2E3442] pb-4">
          <p className="text-sm font-medium text-[#A8B0BF]">Track Completed</p>
          <h2 id="result-heading" className="text-2xl font-bold text-[#F3F4F6]">
            {chart.title}
          </h2>
          <p className="text-sm text-[#A8B0BF]">
            {chart.artist} | {chart.bpm} BPM | {chart.difficulty.toUpperCase()}
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
          <div className="p-4 rounded-md bg-[#111318] border border-[#64748B]">
            <dt className="text-xs font-medium uppercase text-[#A8B0BF]">Final Score</dt>
            <dd className="text-3xl font-bold text-[#F3F4F6] mt-1">
              {scoreState.score.toLocaleString()}
            </dd>
          </div>

          <div className="p-4 rounded-md bg-[#111318] border border-[#64748B]">
            <dt className="text-xs font-medium uppercase text-[#A8B0BF]">Accuracy</dt>
            <dd className="text-3xl font-bold text-[#34D399] mt-1">
              {scoreState.accuracy.toFixed(1)}%
            </dd>
          </div>

          <div className="p-4 rounded-md bg-[#111318] border border-[#64748B]">
            <dt className="text-xs font-medium uppercase text-[#A8B0BF]">Max Combo</dt>
            <dd className="text-3xl font-bold text-[#F3F4F6] mt-1">
              {scoreState.maxCombo}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#F3F4F6]">Judgement Breakdown</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
            <div className="p-3 rounded-md bg-[#111318] border border-[#2E3442]">
              <dt className="text-xs font-semibold text-[#34D399]">PERFECT</dt>
              <dd className="text-xl font-bold text-[#F3F4F6] mt-1">
                {scoreState.counts.PERFECT}
              </dd>
            </div>
            <div className="p-3 rounded-md bg-[#111318] border border-[#2E3442]">
              <dt className="text-xs font-semibold text-[#FBBF24]">GREAT</dt>
              <dd className="text-xl font-bold text-[#F3F4F6] mt-1">
                {scoreState.counts.GREAT}
              </dd>
            </div>
            <div className="p-3 rounded-md bg-[#111318] border border-[#2E3442]">
              <dt className="text-xs font-semibold text-[#38BDF8]">GOOD</dt>
              <dd className="text-xl font-bold text-[#F3F4F6] mt-1">
                {scoreState.counts.GOOD}
              </dd>
            </div>
            <div className="p-3 rounded-md bg-[#111318] border border-[#2E3442]">
              <dt className="text-xs font-semibold text-[#FB7185]">MISS</dt>
              <dd className="text-xl font-bold text-[#F3F4F6] mt-1">
                {scoreState.counts.MISS}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-md bg-[#BE123C] hover:bg-[#9F1239] text-white font-semibold text-sm transition-colors"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onBackToList}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-md bg-[#111318] border border-[#64748B] hover:bg-[#20242E] text-[#F3F4F6] font-medium text-sm transition-colors"
          >
            Back to Song List
          </button>
        </div>
      </div>
    </section>
  );
}

