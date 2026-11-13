import { useEffect } from "react";
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

export function ResultScreen({
  chart,
  scoreState,
  isNewBest,
  onPlayAgain,
  onBackToList
}: ResultScreenProps) {
  const isVictory = scoreState.accuracy >= 60;
  const audio = AudioManager.getInstance();

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
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[280deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 max-w-4xl mx-auto w-full flex items-center justify-between">
        <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
          STAGE RESULTS
        </h2>
        <span
          className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase italic shadow-[0_4px_0_#000] ${
            isVictory ? "bg-[#34D399] text-black" : "bg-[#E11D48] text-white"
          }`}
        >
          {isVictory ? "STAGE CLEARED!" : "STAGE FAILED!"}
        </span>
      </header>

      {/* Main Card */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-8 space-y-6 transform -skew-x-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-[#E11D48] text-white text-xs font-black uppercase">
                  {chart.difficulty}
                </span>
                {isNewBest && (
                  <span className="px-2.5 py-0.5 rounded bg-[#FDE047] text-black text-xs font-black uppercase">
                    NEW PERSONAL BEST!
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-black italic text-white uppercase mt-1">
                {chart.title}
              </h3>
              <p className="text-xs font-semibold text-gray-300">
                vs {chart.artist} | {chart.bpm} BPM
              </p>
            </div>

            <div className="flex justify-center shrink-0">
              <BattleCharacter
                role="player"
                name="Boyfriend"
                state={isVictory ? "victory" : "defeat"}
                facing="right"
                compact
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
            <div className="p-4 rounded-xl bg-black/60 border-2 border-white/20 text-center">
              <span className="text-xs font-black uppercase text-gray-400">Total Score</span>
              <p className="text-3xl font-black text-[#FDE047] mt-1">
                {scoreState.score.toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border-2 border-white/20 text-center">
              <span className="text-xs font-black uppercase text-gray-400">Accuracy</span>
              <p className="text-3xl font-black text-[#34D399] mt-1">
                {scoreState.accuracy.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border-2 border-white/20 text-center">
              <span className="text-xs font-black uppercase text-gray-400">Max Combo</span>
              <p className="text-3xl font-black text-[#38BDF8] mt-1">
                {scoreState.maxCombo}x
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-black uppercase tracking-wider text-[#FDE047] italic">
              Judgement Breakdown
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
              <div className="p-3 rounded-lg bg-black/60 border border-white/15">
                <span className="text-xs font-black text-[#FBBF24]">SICK (PERFECT)</span>
                <p className="text-xl font-black text-white mt-0.5">
                  {scoreState.counts.PERFECT}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/15">
                <span className="text-xs font-black text-[#34D399]">GOOD (GREAT)</span>
                <p className="text-xl font-black text-white mt-0.5">
                  {scoreState.counts.GREAT}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/15">
                <span className="text-xs font-black text-[#38BDF8]">BAD (GOOD)</span>
                <p className="text-xl font-black text-white mt-0.5">
                  {scoreState.counts.GOOD}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-white/15">
                <span className="text-xs font-black text-[#FB7185]">MISS</span>
                <p className="text-xl font-black text-white mt-0.5">
                  {scoreState.counts.MISS}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayAgain}
              className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] border-2 border-white shadow-[0_4px_0_#000] text-white font-black text-base uppercase italic transition-transform active:translate-y-0.5"
            >
              PLAY AGAIN
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/30 text-white font-black text-base uppercase italic"
            >
              BACK TO FREE PLAY
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-5 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Practice difficult sections to reach 100% accuracy!
      </footer>
    </div>
  );
}
