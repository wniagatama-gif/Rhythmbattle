import { useEffect, useMemo } from "react";
import type { ChartFile } from "../game/types/chart";
import type { ScoreState } from "../game/types/game";
import { BattleCharacter } from "./characters/BattleCharacter";
import { AudioManager } from "../game/engine/AudioManager";

interface ResultScreenProps {
  chart: ChartFile;
  scoreState: ScoreState;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onBackToList: () => void;
}

function getRankAsset(accuracy: number, isVictory: boolean): { src: string; alt: string } {
  if (!isVictory) {
    return { src: "/assets/images/results/rankTextLOSS.png", alt: "LOSS" };
  }
  if (accuracy >= 99) {
    return { src: "/assets/images/results/rankTextPERFECT.png", alt: "PERFECT" };
  }
  if (accuracy >= 94) {
    return { src: "/assets/images/results/rankTextEXCELLENT.png", alt: "EXCELLENT" };
  }
  if (accuracy >= 80) {
    return { src: "/assets/images/results/rankTextGREAT.png", alt: "GREAT" };
  }
  return { src: "/assets/images/results/rankTextGOOD.png", alt: "GOOD" };
}

function getDifficultyAsset(difficulty: string): string {
  const lower = difficulty.toLowerCase();
  if (lower === "easy") return "/assets/images/results/diff_easy.png";
  if (lower === "hard") return "/assets/images/results/diff_hard.png";
  return "/assets/images/results/diff_normal.png";
}

export function ResultScreen({
  chart,
  scoreState,
  isNewBest,
  onPlayAgain,
  onBackToList
}: ResultScreenProps) {
  const isVictory = scoreState.accuracy >= 60;
  const audio = AudioManager.getInstance();
  const rank = useMemo(
    () => getRankAsset(scoreState.accuracy, isVictory),
    [scoreState.accuracy, isVictory]
  );
  const diffAsset = useMemo(
    () => getDifficultyAsset(chart.difficulty),
    [chart.difficulty]
  );

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const handlePlayAgain = (): void => {
    audio.playConfirm();
    audio.stopMenuMusic();
    onPlayAgain();
  };

  const handleBack = (): void => {
    audio.playCancel();
    onBackToList();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none bg-[#0B0D14] text-[#F8FAFC]">
      {/* Official FNF Results Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "url('/assets/images/results/results.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D14]/80 via-[#0B0D14]/90 to-[#0B0D14] pointer-events-none" />

      {/* Official FNF Top Bar Header */}
      <header className="relative z-10 w-full shrink-0">
        <div
          className="w-full h-14 bg-repeat-x bg-contain flex items-center justify-between px-4 sm:px-8 border-b-2 border-[#090B10]"
          style={{ backgroundImage: "url('/assets/images/results/topBarBlack.png')" }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black italic tracking-wider text-[#F8FAFC] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Stage Results
            </h2>
            <img
              src={diffAsset}
              alt={chart.difficulty}
              className="h-6 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <img
              src={rank.src}
              alt={rank.alt}
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
            />
            <span
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase italic border-2 border-[#090B10] shadow-[0_2px_0_#05070B] ${
                isVictory ? "bg-[#34D399] text-[#090B10]" : "bg-[#BE123C] text-white"
              }`}
            >
              {isVictory ? "Clear" : "Failed"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="relative z-10 flex-1 my-auto max-w-6xl w-full mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Column: Boyfriend Character in Victory or Defeat */}
        <div className="w-full md:w-5/12 flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center">
            <BattleCharacter
              role="player"
              name="Boyfriend"
              title={isVictory ? "Champion" : "Knocked Out"}
              state={isVictory ? "victory" : "defeat"}
              facing="right"
              modelConfig={{ renderer: "fnf-atlas" }}
              compact={false}
            />
            {isNewBest && (
              <div className="mt-3 px-3.5 py-1 rounded-full bg-[#FBBF24] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-xs font-black uppercase text-[#090B10] animate-bounce">
                New Record High Score!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statistics & Judgment Breakdown Card */}
        <div className="w-full md:w-7/12">
          <div className="bg-[#141824]/95 border-4 border-[#090B10] shadow-[0_10px_0_#05070B] rounded-2xl p-5 sm:p-7 space-y-5">
            {/* Song Meta */}
            <div className="border-b-2 border-[#090B10] pb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FBBF24]">
                Performance Summary
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic text-[#F8FAFC] uppercase truncate mt-0.5">
                {chart.title}
              </h3>
              <p className="text-xs font-bold text-[#CBD5E1] mt-0.5">
                Track by {chart.artist} | {chart.bpm} BPM
              </p>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-3 gap-3 tabular-nums">
              <div className="p-3 sm:p-4 rounded-xl bg-[#0B0D14] border-2 border-[#090B10] text-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#94A3B8]">
                  Score
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#FBBF24] mt-1">
                  {scoreState.score.toLocaleString()}
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-[#0B0D14] border-2 border-[#090B10] text-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#94A3B8]">
                  Accuracy
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#34D399] mt-1">
                  {scoreState.accuracy.toFixed(1)}%
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-[#0B0D14] border-2 border-[#090B10] text-center">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#94A3B8]">
                  Max Combo
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#38BDF8] mt-1">
                  {scoreState.maxCombo}x
                </p>
              </div>
            </div>

            {/* Judgment Breakdown with Official FNF Badges */}
            <div className="space-y-2 pt-2 border-t-2 border-[#090B10]">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#CBD5E1]">
                Judgement Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
                <div className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#090B10] flex flex-col items-center">
                  <img
                    src="/assets/images/ui/popup/sick.png"
                    alt="SICK"
                    className="h-5 w-auto object-contain mb-1"
                  />
                  <span className="text-lg font-black text-[#FBBF24]">
                    {scoreState.counts.PERFECT}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#090B10] flex flex-col items-center">
                  <img
                    src="/assets/images/ui/popup/good.png"
                    alt="GOOD"
                    className="h-5 w-auto object-contain mb-1"
                  />
                  <span className="text-lg font-black text-[#34D399]">
                    {scoreState.counts.GREAT}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#090B10] flex flex-col items-center">
                  <img
                    src="/assets/images/ui/popup/bad.png"
                    alt="BAD"
                    className="h-5 w-auto object-contain mb-1"
                  />
                  <span className="text-lg font-black text-[#38BDF8]">
                    {scoreState.counts.GOOD}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#090B10] flex flex-col items-center">
                  <img
                    src="/assets/images/ui/popup/shit.png"
                    alt="MISS"
                    className="h-5 w-auto object-contain mb-1"
                  />
                  <span className="text-lg font-black text-[#FB7185]">
                    {scoreState.counts.MISS}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="flex-1 min-h-[48px] px-6 py-2.5 rounded-xl bg-[#BE123C] hover:bg-[#9F1239] border-3 border-[#090B10] shadow-[0_4px_0_#05070B] text-white font-black text-sm uppercase italic tracking-wider transition-all active:translate-y-0.5"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1E2436] hover:bg-[#2A334B] border-3 border-[#090B10] shadow-[0_4px_0_#05070B] text-[#F8FAFC] font-extrabold text-sm uppercase italic tracking-wider transition-all active:translate-y-0.5"
              >
                Back to Free Play
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-3 text-center text-xs font-bold text-[#94A3B8] drop-shadow-[0_2px_0_#05070B]">
        Press Enter or click Play Again to retry the stage
      </footer>
    </div>
  );
}
