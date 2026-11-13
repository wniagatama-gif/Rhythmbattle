import { useEffect, useState } from "react";
import { AudioManager } from "../../game/engine/AudioManager";
import { BattleCharacter, type CharacterModelConfig } from "./BattleCharacter";
import type { CharacterAnimState } from "../../game/types/game";

export interface PlayableCharacter {
  id: string;
  name: string;
  tagline: string;
  iconSrc: string;
  modelConfig: CharacterModelConfig;
}

export const PLAYABLE_CHARACTERS: readonly PlayableCharacter[] = [
  {
    id: "boyfriend",
    name: "Boyfriend",
    tagline: "The blue-haired protagonist with immaculate mic skills",
    iconSrc: "/assets/images/icons/icon-bf.png",
    modelConfig: {
      renderer: "fnf-atlas"
    }
  },
  {
    id: "spooky-kids",
    name: "Spooky Kids",
    tagline: "Skid & Pump dancing together to celebrate Spooky Month",
    iconSrc: "/assets/images/icons/icon-spooky.png",
    modelConfig: {
      renderer: "fnf-atlas"
    }
  },
  {
    id: "daddy-dearest",
    name: "Daddy Dearest",
    tagline: "Ex-rockstar demon father testing your rhythm prowess",
    iconSrc: "/assets/images/icons/icon-dad.png",
    modelConfig: {
      renderer: "2d-placeholder"
    }
  }
];

const SELECTED_CHAR_KEY = "rhythm_battle_selected_character";

export function loadSelectedCharacter(): PlayableCharacter {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SELECTED_CHAR_KEY);
      const match = PLAYABLE_CHARACTERS.find((c) => c.id === stored);
      if (match) return match;
    } catch {
      // Default fallback
    }
  }
  return PLAYABLE_CHARACTERS[0] ?? {
    id: "boyfriend",
    name: "Boyfriend",
    tagline: "The blue-haired protagonist",
    iconSrc: "/assets/images/icons/icon-bf.png",
    modelConfig: { renderer: "fnf-atlas" }
  };
}

export function saveSelectedCharacter(charId: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SELECTED_CHAR_KEY, charId);
    } catch {
      // LocalStorage error ignored
    }
  }
}

interface CharacterSelectScreenProps {
  onBack: () => void;
  onSelectCharacter?: (char: PlayableCharacter) => void;
}

export function CharacterSelectScreen({ onBack, onSelectCharacter }: CharacterSelectScreenProps) {
  const audio = AudioManager.getInstance();
  const [selectedId, setSelectedId] = useState<string>(() => loadSelectedCharacter().id);
  const [previewAnim, setPreviewAnim] = useState<CharacterAnimState>("idle");
  const [beatPulse, setBeatPulse] = useState<number>(0);

  useEffect(() => {
    audio.playMenuMusic();
    const interval = window.setInterval(() => {
      setBeatPulse((b) => (b + 1) % 100);
    }, 550);
    return () => window.clearInterval(interval);
  }, [audio]);

  const activeChar = PLAYABLE_CHARACTERS.find((c) => c.id === selectedId) ?? PLAYABLE_CHARACTERS[0]!;

  const handlePick = (char: PlayableCharacter): void => {
    if (char.id !== selectedId) {
      setSelectedId(char.id);
      saveSelectedCharacter(char.id);
      audio.playScroll();
      onSelectCharacter?.(char);
    } else {
      audio.playConfirm();
      setPreviewAnim("special");
      window.setTimeout(() => setPreviewAnim("idle"), 400);
    }
  };

  const handleBack = (): void => {
    audio.playCancel();
    onBack();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "ArrowLeft") {
        setPreviewAnim("singLeft");
        window.setTimeout(() => setPreviewAnim("idle"), 250);
      } else if (e.key === "ArrowDown") {
        setPreviewAnim("singDown");
        window.setTimeout(() => setPreviewAnim("idle"), 250);
      } else if (e.key === "ArrowUp") {
        setPreviewAnim("singUp");
        window.setTimeout(() => setPreviewAnim("idle"), 250);
      } else if (e.key === "ArrowRight") {
        setPreviewAnim("singRight");
        window.setTimeout(() => setPreviewAnim("idle"), 250);
      } else if (e.key === "Escape") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[180deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#000000]/70 border-2 border-[#FDE047] text-white font-black text-sm uppercase hover:bg-black transition-transform active:translate-y-0.5"
          >
            ◀ BACK (ESC)
          </button>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
            CHARACTER ROSTER
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Character Card List */}
        <div className="md:col-span-6 space-y-3">
          <p className="text-xs font-black uppercase text-[#FDE047] italic tracking-wider">
            Choose Your Singer
          </p>
          <div className="space-y-3">
            {PLAYABLE_CHARACTERS.map((char) => {
              const isSelected = char.id === selectedId;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => handlePick(char)}
                  className={`w-full text-left p-4 rounded-2xl border-4 transition-all duration-150 transform -skew-x-3 flex items-center gap-4 ${
                    isSelected
                      ? "bg-white border-[#FDE047] shadow-[0_8px_0_#000] scale-[1.02]"
                      : "bg-black/75 border-[#1E2436] hover:bg-black/90 shadow-[0_4px_0_#000]"
                  }`}
                >
                  <img
                    src={char.iconSrc}
                    alt={char.name}
                    className="w-14 h-14 object-contain rounded-lg bg-black/30 p-1 border-2 border-black/40"
                  />
                  <div className="min-w-0">
                    <h3
                      className={`text-xl font-black italic uppercase ${
                        isSelected ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {char.name}
                    </h3>
                    <p
                      className={`text-xs font-semibold ${
                        isSelected ? "text-slate-600" : "text-gray-300"
                      }`}
                    >
                      {char.tagline}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-xs font-black px-2.5 py-1 rounded bg-[#E11D48] text-white uppercase shrink-0">
                      SELECTED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Stage Character Preview */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/80 border-4 border-[#FDE047] shadow-[0_8px_0_#000] min-h-[380px]">
          <div className="mb-2 text-center">
            <span className="text-lg font-black text-white uppercase italic">
              Live Stage Preview
            </span>
            <p className="text-xs font-semibold text-gray-300">
              Press Arrow Keys (← ↓ ↑ →) to test singing poses!
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <BattleCharacter
              role="player"
              name={activeChar.name}
              title="Singer Preview"
              state={previewAnim}
              facing="right"
              beatPhase={beatPulse}
              modelConfig={activeChar.modelConfig}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Selected character will be used in Free Play and Online PvP matches!
      </footer>
    </div>
  );
}
