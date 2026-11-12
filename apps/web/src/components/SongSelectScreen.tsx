import {
  LANE_CONFIG,
  MAX_SCROLL_SPEED,
  MIN_SCROLL_SPEED
} from "../game/constants";
import type { BestScoresMap } from "../game/storage/bestScores";
import type { ChartFile } from "../game/types/chart";
import { TrackCoverArt } from "./stage/TrackCoverArt";

interface SongSelectScreenProps {
  charts: ChartFile[];
  bestScores: BestScoresMap;
  parseError: string | null;
  engineError: string | null;
  selectedChartId: string;
  scrollSpeed: number;
  isLoadingAudio: boolean;
  onSelectChart: (chartId: string) => void;
  onScrollSpeedChange: (speed: number) => void;
  onStartTrack: (chart: ChartFile) => void;
  onDismissError: () => void;
}

export function SongSelectScreen({
  charts,
  bestScores,
  parseError,
  engineError,
  selectedChartId,
  scrollSpeed,
  isLoadingAudio,
  onSelectChart,
  onScrollSpeedChange,
  onStartTrack,
  onDismissError
}: SongSelectScreenProps) {
  const activeChart = charts.find((chart) => chart.id === selectedChartId) ?? charts[0] ?? null;
  const activeBest = activeChart ? bestScores[activeChart.id] : undefined;
  const activeError = engineError ?? parseError;

  return (
    <section aria-labelledby="song-select-heading" className="space-y-6">
      {activeError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#2A1118] border-2 border-[#F43F5E] text-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-extrabold uppercase text-[#FB7185]">Playback Error</p>
            <p className="text-sm text-[#F8FAFC]">{activeError}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="min-h-[44px] px-4 py-2 rounded-md bg-[#141824] border-2 border-[#090B10] text-sm font-bold text-[#F8FAFC] hover:bg-[#1E2436] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {charts.length === 0 ? (
        <div className="p-8 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] text-center space-y-2">
          <h2 id="song-select-heading" className="text-xl font-black uppercase text-[#F8FAFC]">
            No Valid Charts Loaded
          </h2>
          <p className="text-sm text-[#CBD5E1]">
            Add valid chart JSON files to packages/game-data/charts to start a battle.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Arcade Track Roster */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="song-select-heading" className="text-xl font-black uppercase tracking-tight text-[#F8FAFC]">
                Stage Select
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1] tabular-nums">
                {charts.length} {charts.length === 1 ? "track" : "tracks"}
              </span>
            </div>

            <div role="radiogroup" aria-label="Available tracks" className="space-y-3">
              {charts.map((chart) => {
                const isSelected = activeChart?.id === chart.id;
                const record = bestScores[chart.id];

                return (
                  <button
                    key={chart.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectChart(chart.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-transform flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-[#1E2436] border-[#F43F5E] shadow-[0_6px_0_#05070B] -translate-y-0.5"
                        : "bg-[#141824] border-[#090B10] shadow-[0_4px_0_#05070B] hover:bg-[#1A2030]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <TrackCoverArt
                        chartId={chart.id}
                        difficulty={chart.difficulty}
                        bpm={chart.bpm}
                        size="sm"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-[#F8FAFC] truncate">
                            {chart.title}
                          </span>
                          <span className="px-2 py-0.5 rounded border border-[#090B10] bg-[#0B0D14] text-[11px] font-extrabold uppercase text-[#FBBF24]">
                            {chart.difficulty}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#CBD5E1]">
                          Opponent: {chart.artist}
                        </p>
                      </div>
                    </div>

                    <dl className="flex items-center gap-4 sm:gap-5 text-sm tabular-nums shrink-0 pl-1 sm:pl-0">
                      <div>
                        <dt className="text-[11px] font-bold uppercase text-[#94A3B8]">BPM</dt>
                        <dd className="font-extrabold text-[#F8FAFC]">{chart.bpm}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase text-[#94A3B8]">Best</dt>
                        <dd className="font-extrabold text-[#38BDF8]">
                          {record ? record.score.toLocaleString() : "--"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase text-[#94A3B8]">Notes</dt>
                        <dd className="font-extrabold text-[#F8FAFC]">{chart.notes.length}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Track Showcase & Battle Launch */}
          {activeChart && (
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] space-y-5">
              <div className="flex items-center gap-4">
                <TrackCoverArt
                  chartId={activeChart.id}
                  difficulty={activeChart.difficulty}
                  bpm={activeChart.bpm}
                  size="lg"
                />
                <div className="min-w-0 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded border border-[#090B10] bg-[#0B0D14] text-[11px] font-extrabold uppercase text-[#FBBF24]">
                    {activeChart.difficulty}
                  </span>
                  <h3 className="text-xl font-black text-[#F8FAFC] leading-tight">
                    {activeChart.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#CBD5E1]">
                    vs {activeChart.artist} | {activeChart.duration}s
                  </p>
                  <p className="text-xs font-bold text-[#38BDF8] tabular-nums">
                    Best Score: {activeBest ? `${activeBest.score.toLocaleString()} (${activeBest.accuracy.toFixed(1)}%)` : "No clear yet"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#1E2436]">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="scroll-speed-slider" className="font-bold text-[#F8FAFC]">
                    Note Scroll Speed
                  </label>
                  <span className="font-extrabold text-[#FBBF24] tabular-nums">
                    {scrollSpeed} px/s
                  </span>
                </div>
                <input
                  id="scroll-speed-slider"
                  type="range"
                  min={MIN_SCROLL_SPEED}
                  max={MAX_SCROLL_SPEED}
                  step={50}
                  value={scrollSpeed}
                  onChange={(e) => onScrollSpeedChange(Number(e.target.value))}
                  className="w-full h-11 accent-[#E11D48] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-semibold text-[#CBD5E1] tabular-nums">
                  <span>{MIN_SCROLL_SPEED} px/s</span>
                  <span>{MAX_SCROLL_SPEED} px/s</span>
                </div>
              </div>

              {/* Centralized Final Lane Order Preview: LEFT -> DOWN -> UP -> RIGHT */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1]">
                  Lane Mapping (Arrow Keys)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {LANE_CONFIG.map((lane) => (
                    <div
                      key={lane.id}
                      className="p-2.5 rounded-lg bg-[#0B0D14] border-2 border-[#090B10] text-center"
                    >
                      <div
                        className="text-xl font-black leading-none"
                        style={{ color: lane.textColorOnDark }}
                      >
                        {lane.symbol}
                      </div>
                      <div className="text-[11px] font-extrabold text-[#F8FAFC] mt-1">
                        {lane.direction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={!activeChart || isLoadingAudio}
                onClick={() => onStartTrack(activeChart)}
                className="w-full min-h-[52px] px-5 py-3 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] disabled:opacity-60 text-white font-black uppercase tracking-wide text-base transition-colors"
              >
                {isLoadingAudio ? "Preparing Audio Buffer..." : "Play Battle"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
