import {
  LANE_KEY_NAMES,
  LANE_LABELS,
  MAX_SCROLL_SPEED,
  MIN_SCROLL_SPEED
} from "../game/constants";
import type { ChartFile } from "../game/types/chart";

interface SongSelectScreenProps {
  charts: ChartFile[];
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
  const activeError = engineError ?? parseError;

  return (
    <section aria-labelledby="song-select-heading" className="space-y-6">
      {activeError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-[#2A151B] border border-[#F43F5E] text-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#FB7185]">Playback Error</p>
            <p className="text-sm text-[#F3F4F6]">{activeError}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="min-h-[44px] px-4 py-2 rounded-md bg-[#181B22] border border-[#64748B] text-sm font-medium text-[#F3F4F6] hover:bg-[#20242E] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {charts.length === 0 ? (
        <div className="p-8 rounded-lg bg-[#181B22] border border-[#64748B] text-center space-y-2">
          <h2 id="song-select-heading" className="text-lg font-semibold text-[#F3F4F6]">
            No Valid Charts Loaded
          </h2>
          <p className="text-sm text-[#A8B0BF]">
            Add valid chart JSON files to packages/game-data/charts to play a track.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Track List (Primary Decision) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="song-select-heading" className="text-lg font-semibold text-[#F3F4F6]">
                Select Track
              </h2>
              <span className="text-sm text-[#A8B0BF] tabular-nums">
                {charts.length} {charts.length === 1 ? "track" : "tracks"} available
              </span>
            </div>

            <div role="radiogroup" aria-label="Available tracks" className="space-y-3">
              {charts.map((chart) => {
                const isSelected = activeChart?.id === chart.id;
                return (
                  <button
                    key={chart.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectChart(chart.id)}
                    className={`w-full min-h-[68px] text-left p-4 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#20242E] border-[#F43F5E]"
                        : "bg-[#181B22] border-[#64748B] hover:bg-[#20242E]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-semibold text-[#F3F4F6]">
                          {chart.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium uppercase bg-[#111318] border border-[#64748B] text-[#A8B0BF]">
                          {chart.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-[#A8B0BF]">{chart.artist}</p>
                    </div>

                    <dl className="flex items-center gap-5 text-sm tabular-nums shrink-0">
                      <div>
                        <dt className="text-xs text-[#A8B0BF]">BPM</dt>
                        <dd className="font-semibold text-[#F3F4F6]">{chart.bpm}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#A8B0BF]">Notes</dt>
                        <dd className="font-semibold text-[#F3F4F6]">{chart.notes.length}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#A8B0BF]">Length</dt>
                        <dd className="font-semibold text-[#F3F4F6]">{chart.duration}s</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup & Launch Panel */}
          <div className="lg:col-span-5 p-6 rounded-lg bg-[#181B22] border border-[#64748B] space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#F3F4F6]">
                {activeChart?.title}
              </h3>
              <p className="text-sm text-[#A8B0BF]">
                Web Audio API synthesizer syncs to {activeChart?.bpm} BPM when no external audio file is set.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="scroll-speed-slider" className="font-medium text-[#F3F4F6]">
                  Scroll Speed
                </label>
                <span className="font-semibold text-[#F3F4F6] tabular-nums">
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
                className="w-full h-11 accent-[#BE123C] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[#A8B0BF] tabular-nums">
                <span>{MIN_SCROLL_SPEED} px/s</span>
                <span>{MAX_SCROLL_SPEED} px/s</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#F3F4F6]">Lane Controls (Arrow Keys)</p>
              <div className="grid grid-cols-4 gap-2">
                {LANE_LABELS.map((symbol, index) => (
                  <div
                    key={symbol}
                    className="p-2.5 rounded-md bg-[#111318] border border-[#64748B] text-center"
                  >
                    <div className="text-base font-semibold text-[#F3F4F6]">{symbol}</div>
                    <div className="text-xs text-[#A8B0BF]">{LANE_KEY_NAMES[index]}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!activeChart || isLoadingAudio}
              onClick={() => {
                if (activeChart) {
                  onStartTrack(activeChart);
                }
              }}
              className="w-full min-h-[48px] px-5 py-3 rounded-md bg-[#BE123C] hover:bg-[#9F1239] disabled:opacity-60 text-white font-semibold text-base transition-colors"
            >
              {isLoadingAudio ? "Preparing Audio Buffer..." : "Start Track"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

