import { useEffect, useState } from "react";
import { AudioManager } from "../../game/engine/AudioManager";

export type MainMenuTarget =
  | "free-play"
  | "online-pvp"
  | "character-select"
  | "settings"
  | "leaderboard"
  | "profile";

interface MainMenuItem {
  id: MainMenuTarget;
  label: string;
  sublabel: string;
  imageSrc?: string;
  accentColor: string;
}

const MENU_ITEMS: readonly MainMenuItem[] = [
  {
    id: "free-play",
    label: "FREE PLAY",
    sublabel: "Select tracks, difficulties, and practice solo",
    imageSrc: "/assets/images/menu/freeplay.png",
    accentColor: "#F43F5E"
  },
  {
    id: "online-pvp",
    label: "ONLINE PVP",
    sublabel: "Real-time 1v1 battle, quick match and private rooms",
    accentColor: "#0284C7"
  },
  {
    id: "character-select",
    label: "CHARACTERS",
    sublabel: "Pick Boyfriend, Spooky Kids, or Daddy Dearest",
    accentColor: "#A855F7"
  },
  {
    id: "settings",
    label: "SETTINGS",
    sublabel: "Volume, scroll speed, controls, and calibration",
    imageSrc: "/assets/images/menu/options.png",
    accentColor: "#F59E0B"
  },
  {
    id: "leaderboard",
    label: "LEADERBOARD",
    sublabel: "View highest scores, full combos, and ratings",
    accentColor: "#10B981"
  },
  {
    id: "profile",
    label: "PROFILE",
    sublabel: "Player stats, history, and records",
    accentColor: "#EC4899"
  }
];

interface MainMenuScreenProps {
  onNavigate: (target: MainMenuTarget) => void;
  apiConnected: boolean;
}

export function MainMenuScreen({ onNavigate, apiConnected }: MainMenuScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const audio = AudioManager.getInstance();

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const handleSelect = (index: number): void => {
    if (index === selectedIndex) {
      triggerConfirm(MENU_ITEMS[index]?.id ?? "free-play");
    } else {
      setSelectedIndex(index);
      audio.playScroll();
    }
  };

  const triggerConfirm = (target: MainMenuTarget): void => {
    if (isConfirming) {
      return;
    }
    setIsConfirming(true);
    audio.playConfirm();
    window.setTimeout(() => {
      onNavigate(target);
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isConfirming) {
        return;
      }

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev <= 0 ? MENU_ITEMS.length - 1 : prev - 1;
          audio.playScroll();
          return next;
        });
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev >= MENU_ITEMS.length - 1 ? 0 : prev + 1;
          audio.playScroll();
          return next;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const active = MENU_ITEMS[selectedIndex];
        if (active) {
          triggerConfirm(active.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, isConfirming, audio]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* FNF Golden Yellow Menu Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-200"
        style={{ backgroundImage: "url('/assets/images/menu/menuBG.png')" }}
      />

      {/* Flashing Magenta Background on Select */}
      {isConfirming && (
        <div
          className="absolute inset-0 bg-cover bg-center animate-fnf-flash z-10 pointer-events-none"
          style={{ backgroundImage: "url('/assets/images/menu/menuBGMagenta.png')" }}
        />
      )}

      {/* Top Banner / Logo Area */}
      <header className="relative z-20 pt-6 px-6 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/assets/images/menu/logoBumpin.png"
            alt="Friday Night Funkin Logo"
            className="w-40 sm:w-52 object-contain animate-fnf-bump drop-shadow-[0_8px_0_rgba(0,0,0,0.8)]"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
              Modern Rhythm Battle
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#FDE047] drop-shadow-[0_2px_0_#000]">
              Friday Night Funkin Engine & Online 1v1 PvP
            </p>
          </div>
        </div>

        {/* Server Indicator */}
        <div className="flex items-center gap-2 bg-[#000000]/70 px-3 py-1.5 rounded-full border-2 border-[#FDE047] text-xs font-bold text-white">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              apiConnected ? "bg-[#22C55E]" : "bg-[#EF4444]"
            }`}
          />
          <span>{apiConnected ? "Server Online" : "Server Offline"}</span>
        </div>
      </header>

      {/* Centered Slanted FNF Menu Items */}
      <main className="relative z-20 my-auto py-4 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div role="menu" aria-label="Main Navigation" className="flex flex-col gap-2.5">
          {MENU_ITEMS.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                aria-selected={isSelected}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => {
                  if (selectedIndex !== idx && !isConfirming) {
                    setSelectedIndex(idx);
                    audio.playScroll();
                  }
                }}
                className={`group relative text-left py-2.5 px-6 rounded-xl border-4 transition-all duration-150 transform -skew-x-6 flex items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-[#FFFFFF] border-[#FDE047] shadow-[0_8px_0_#000000] scale-[1.03] translate-x-3"
                    : "bg-[#000000]/75 border-[#1E2436] hover:bg-[#111827]/85 shadow-[0_4px_0_#000000]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`text-2xl sm:text-3xl font-black italic tracking-tighter uppercase ${
                      isSelected ? "text-[#0F172A]" : "text-[#F8FAFC]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`hidden md:inline-block text-xs font-bold italic ${
                      isSelected ? "text-[#475569]" : "text-[#94A3B8]"
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-xl sm:text-2xl font-black text-[#E11D48] animate-pulse">
                      ◀
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Controls Prompt */}
      <footer className="relative z-20 pb-5 px-6 max-w-6xl mx-auto w-full flex items-center justify-between text-xs sm:text-sm font-black text-white uppercase drop-shadow-[0_2px_0_#000]">
        <div className="flex items-center gap-4">
          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/20">
            ↑ / ↓ or W / S : Navigate
          </span>
          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/20">
            ENTER : Select
          </span>
        </div>
        <span className="text-[#FDE047] font-extrabold italic">
          Press any key to funk!
        </span>
      </footer>
    </div>
  );
}
