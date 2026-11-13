import { useEffect, useState } from "react";
import { AudioManager } from "../game/engine/AudioManager";
import type { BestScoresMap } from "../game/storage/bestScores";
import type { ChartFile } from "../game/types/chart";

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
  onBackToMenu?: () => void;
}

const DIFFICULTY_IMAGES: Record<string, string> = {
  easy: "/assets/images/freeplay/freeplayeasy.png",
  normal: "/assets/images/freeplay/freeplaynormal.png",
  hard: "/assets/images/freeplay/freeplayhard.png"
};

function getOpponentIcon(chart: ChartFile): string {
  const lower = (chart.artist + " " + chart.title).toLowerCase();
  if (lower.includes("spooky") || lower.includes("skid") || lower.includes("pump")) {
    return "/assets/images/icons/icon-spooky.png";
  }
  if (lower.includes("dad") || lower.includes("dearest")) {
    return "/assets/images/icons/icon-dad.png";
  }
  return "/assets/images/icons/icon-bf.png";
}

export function SongSelectScreen({
  charts,
  bestScores,
  parseError,
  engineError,
  selectedChartId,
  isLoadingAudio,
  onSelectChart,
  onStartTrack,
  onDismissError,
  onBackToMenu
}: SongSelectScreenProps) {
  const audio = AudioManager.getInstance();
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "normal" | "hard">("hard");
  const activeError = engineError ?? parseError;

  const activeChart = charts.find((chart) => chart.id === selectedChartId) ?? charts[0] ?? null;
  const activeBest = activeChart ? bestScores[activeChart.id] : undefined;

  // Start audio preview when active track changes
  useEffect(() => {
    if (activeChart?.audioFile) {
      audio.startSongPreview(activeChart.audioFile);
    }
    return () => {
      audio.stopPreview();
    };
  }, [activeChart?.id, audio]);

  const handleSelectTrack = (chart: ChartFile): void => {
    if (chart.id !== selectedChartId) {
      onSelectChart(chart.id);
      audio.playScroll();
    }
  };

  const handleLaunchTrack = (chart: ChartFile): void => {
    audio.playConfirm();
    audio.stopPreview();
    audio.stopMenuMusic();
    onStartTrack(chart);
  };

  const handleBack = (): void => {
    audio.stopPreview();
    audio.playCancel();
    onBackToMenu?.();
  };

  const cycleDifficulty = (direction: -1 | 1): void => {
    const diffs: Array<"easy" | "normal" | "hard"> = ["easy", "normal", "hard"];
    const curIdx = diffs.indexOf(selectedDifficulty);
    const nextIdx = (curIdx + direction + diffs.length) % diffs.length;
    const nextDiff = diffs[nextIdx] ?? "hard";
    setSelectedDifficulty(nextDiff);
    audio.playScroll();

    // Check if another chart has this difficulty
    if (activeChart) {
      const match = charts.find(
        (c) => c.title.toLowerCase() === activeChart.title.toLowerCase() && c.difficulty.toLowerCase() === nextDiff
      );
      if (match) {
        onSelectChart(match.id);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        handleBack();
        return;
      }
      if (e.key === "ArrowLeft") {
        cycleDifficulty(-1);
      } else if (e.key === "ArrowRight") {
        cycleDifficulty(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const curIdx = charts.findIndex((c) => c.id === selectedChartId);
        const prevIdx = curIdx <= 0 ? charts.length - 1 : curIdx - 1;
        const target = charts[prevIdx];
        if (target) {
          onSelectChart(target.id);
          audio.playScroll();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const curIdx = charts.findIndex((c) => c.id === selectedChartId);
        const nextIdx = curIdx >= charts.length - 1 ? 0 : curIdx + 1;
        const target = charts[nextIdx];
        if (target) {
          onSelectChart(target.id);
          audio.playScroll();
        }
      } else if (e.key === "Enter" && activeChart && !isLoadingAudio) {
        handleLaunchTrack(activeChart);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [charts, selectedChartId, activeChart, selectedDifficulty, isLoadingAudio]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* FNF Freeplay Desaturated Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[290deg] brightness-90 transition-all duration-300"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

      {/* Top Header & High Score Display */}
      <header className="relative z-10 pt-5 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-black/70 border-2 border-[#FDE047] text-white font-black text-xs uppercase hover:bg-black transition-transform active:translate-y-0.5"
            >
              ◀ BACK (ESC)
            </button>
          )}
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
            FREE PLAY
          </h2>
        </div>

        {/* FNF Style Personal Best Box */}
        <div className="bg-black/80 border-4 border-[#FDE047] shadow-[0_6px_0_#000] px-5 py-2.5 rounded-xl text-right transform -skew-x-3">
          <span className="text-[11px] font-black uppercase text-gray-300 tracking-wider">
            PERSONAL BEST
          </span>
          <div className="text-xl sm:text-2xl font-black italic text-[#FDE047] tabular-nums leading-none mt-0.5">
            {activeBest ? activeBest.score.toLocaleString() : "NO SCORE"}
          </div>
          <div className="text-xs font-extrabold text-[#38BDF8] tabular-nums mt-0.5">
            {activeBest ? `ACCURACY: ${activeBest.accuracy.toFixed(1)}% | MAX COMBO: ${activeBest.maxCombo}x` : "CLEAR TRACK TO RANK"}
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {activeError && (
        <div
          role="alert"
          className="relative z-20 max-w-2xl mx-auto my-2 p-3 rounded-xl bg-red-900/90 border-2 border-red-400 text-white flex items-center justify-between gap-3 text-sm font-bold"
        >
          <span>{activeError}</span>
          <button
            type="button"
            onClick={onDismissError}
            className="px-3 py-1 rounded bg-black text-xs uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Freeplay Track Roster & Showcase */}
      <main className="relative z-10 my-auto py-4 px-4 sm:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Slanted FNF Track Selection List */}
        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs font-black uppercase text-[#FDE047] italic tracking-wider">
            Select Song (↑ / ↓ or W / S)
          </p>
          <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-2">
            {charts.map((chart, idx) => {
              const isSelected = activeChart?.id === chart.id;
              const icon = getOpponentIcon(chart);

              return (
                <button
                  key={chart.id}
                  type="button"
                  onClick={() => handleSelectTrack(chart)}
                  className={`w-full text-left py-3 px-5 rounded-2xl border-4 transition-all duration-150 transform -skew-x-6 flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-white border-[#FDE047] shadow-[0_8px_0_#000] scale-[1.02] translate-x-3"
                      : "bg-black/75 border-[#1E2436] hover:bg-black/90 shadow-[0_4px_0_#000]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={icon}
                      alt=""
                      className="w-12 h-12 object-contain rounded-lg bg-black/40 p-1 border-2 border-black/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3
                        className={`text-2xl sm:text-3xl font-black italic tracking-tight uppercase truncate ${
                          isSelected ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {chart.title}
                      </h3>
                      <p
                        className={`text-xs font-bold italic ${
                          isSelected ? "text-slate-600" : "text-gray-300"
                        }`}
                      >
                        vs {chart.artist} | {chart.bpm} BPM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${
                        isSelected
                          ? "bg-black text-[#FDE047] border-black"
                          : "bg-black/60 text-[#38BDF8] border-white/20"
                      }`}
                    >
                      {chart.difficulty}
                    </span>
                    {isSelected && (
                      <span className="text-xl font-black text-[#E11D48] animate-pulse">
                        ◀
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Track Detail & Difficulty Selector */}
        {activeChart && (
          <div className="lg:col-span-5 bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-7 space-y-6 transform -skew-x-3">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase text-gray-400">
                Selected Stage
              </span>
              <h3 className="text-3xl sm:text-4xl font-black italic text-white uppercase tracking-tight">
                {activeChart.title}
              </h3>
              <p className="text-sm font-bold text-[#FDE047] italic">
                Opponent: {activeChart.artist} ({activeChart.bpm} BPM | {activeChart.notes.length} notes)
              </p>
            </div>

            {/* FNF Difficulty Switcher with Official Difficulty Graphic */}
            <div className="flex items-center justify-center gap-4 py-2 border-y-2 border-white/10">
              <button
                type="button"
                onClick={() => cycleDifficulty(-1)}
                className="w-10 h-10 rounded-lg bg-black/70 border-2 border-[#FDE047] text-white font-black text-xl hover:bg-black transition-transform active:scale-95 flex items-center justify-center"
                aria-label="Previous difficulty"
              >
                ◀
              </button>

              <div className="min-w-[170px] h-12 flex items-center justify-center">
                {DIFFICULTY_IMAGES[selectedDifficulty] ? (
                  <img
                    src={DIFFICULTY_IMAGES[selectedDifficulty]}
                    alt={selectedDifficulty}
                    className="h-10 object-contain drop-shadow-[0_2px_0_#000]"
                  />
                ) : (
                  <span className="text-2xl font-black italic text-[#FDE047] uppercase">
                    {selectedDifficulty}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => cycleDifficulty(1)}
                className="w-10 h-10 rounded-lg bg-black/70 border-2 border-[#FDE047] text-white font-black text-xl hover:bg-black transition-transform active:scale-95 flex items-center justify-center"
                aria-label="Next difficulty"
              >
                ▶
              </button>
            </div>

            {/* Play Button */}
            <button
              type="button"
              disabled={isLoadingAudio}
              onClick={() => handleLaunchTrack(activeChart)}
              className="w-full min-h-[58px] px-6 py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] border-4 border-white shadow-[0_6px_0_#000] text-white font-black text-xl uppercase italic tracking-wider transition-all transform active:translate-y-1 disabled:opacity-50"
            >
              {isLoadingAudio ? "PREPARING AUDIO..." : "PRESS ENTER TO PLAY!"}
            </button>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="relative z-10 pb-5 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-black text-white uppercase drop-shadow-[0_2px_0_#000] gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/20">
            ↑ / ↓ : Change Song
          </span>
          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/20">
            ← / → : Change Difficulty
          </span>
          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/20">
            ENTER : Start Battle
          </span>
        </div>
        <span className="text-[#FDE047] italic">
          Press ESC to return to Main Menu
        </span>
      </footer>
    </div>
  );
}
