import { useEffect, useState } from "react";
import { AudioManager } from "../../game/engine/AudioManager";
import { loadSelectedCharacter } from "../characters/CharacterSelectScreen";
import type { BestScoresMap } from "../../game/storage/bestScores";
import type { ChartFile } from "../../game/types/chart";

interface ProfileScreenProps {
  charts: ChartFile[];
  bestScores: BestScoresMap;
  playerName: string;
  onUpdatePlayerName?: (name: string) => void;
  onBack: () => void;
}

export function ProfileScreen({
  charts,
  bestScores,
  playerName,
  onUpdatePlayerName,
  onBack
}: ProfileScreenProps) {
  const audio = AudioManager.getInstance();
  const [nameInput, setNameInput] = useState<string>(playerName);
  const activeChar = loadSelectedCharacter();

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const records = Object.values(bestScores);
  const clearedCount = records.filter((r) => r.score > 0).length;
  const bestScore = records.reduce((max, r) => Math.max(max, r.score), 0);
  const maxComboEver = records.reduce((max, r) => Math.max(max, r.maxCombo), 0);
  const avgAccuracy =
    clearedCount > 0
      ? records.reduce((sum, r) => sum + r.accuracy, 0) / clearedCount
      : 0;

  const handleSaveName = (): void => {
    if (nameInput.trim().length > 0) {
      onUpdatePlayerName?.(nameInput.trim());
      audio.playConfirm();
    }
  };

  const handleBack = (): void => {
    audio.playCancel();
    onBack();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[320deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#000000]/70 border-2 border-[#FDE047] text-white font-black text-sm uppercase hover:bg-black transition-transform active:translate-y-0.5"
          >
            ◀ BACK (ESC)
          </button>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
            PLAYER PROFILE
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-8 space-y-6 transform -skew-x-2">
          {/* Identity Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b-2 border-white/10 pb-6">
            <img
              src={activeChar.iconSrc}
              alt={activeChar.name}
              className="w-20 h-20 rounded-2xl bg-black/60 p-2 border-4 border-[#FDE047] object-contain shadow-[0_4px_0_#000]"
            />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  type="text"
                  maxLength={18}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  className="bg-black/60 border-2 border-white/30 rounded-lg px-3 py-1 text-xl font-black italic text-[#FDE047] uppercase max-w-[220px]"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="min-h-[36px] px-3 py-1 rounded-lg bg-[#E11D48] text-white text-xs font-black uppercase hover:bg-[#BE123C]"
                >
                  Save
                </button>
              </div>
              <p className="text-xs font-semibold text-gray-300">
                Active Singer: <strong className="text-white">{activeChar.name}</strong>
              </p>
            </div>
          </div>

          {/* Player Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-black/60 border-2 border-[#1E2436] text-center">
              <span className="text-xs font-black uppercase text-gray-400">Tracks Cleared</span>
              <p className="text-2xl font-black text-[#FDE047] tabular-nums mt-1">
                {clearedCount} / {charts.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border-2 border-[#1E2436] text-center">
              <span className="text-xs font-black uppercase text-gray-400">High Score</span>
              <p className="text-2xl font-black text-[#38BDF8] tabular-nums mt-1">
                {bestScore.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border-2 border-[#1E2436] text-center">
              <span className="text-xs font-black uppercase text-gray-400">Max Combo</span>
              <p className="text-2xl font-black text-[#E11D48] tabular-nums mt-1">
                {maxComboEver}x
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border-2 border-[#1E2436] text-center">
              <span className="text-xs font-black uppercase text-gray-400">Avg Accuracy</span>
              <p className="text-2xl font-black text-[#34D399] tabular-nums mt-1">
                {avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "--"}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Keep funkir rhythm sharp and battle online!
      </footer>
    </div>
  );
}
