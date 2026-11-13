import { useEffect, useState } from "react";
import { AudioManager, type AudioSettings } from "../../game/engine/AudioManager";
import { MAX_SCROLL_SPEED, MIN_SCROLL_SPEED } from "../../game/constants";

interface SettingsScreenProps {
  onBack: () => void;
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
}

export function SettingsScreen({ onBack, scrollSpeed, onScrollSpeedChange }: SettingsScreenProps) {
  const audio = AudioManager.getInstance();
  const [settings, setSettings] = useState<AudioSettings>(() => audio.getSettings());

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]): void => {
    const updated = audio.saveSettings({ [key]: value });
    setSettings(updated);
    if (key === "scrollSpeed" && typeof value === "number") {
      onScrollSpeedChange(value);
    }
  };

  const handleBack = (): void => {
    audio.playCancel();
    onBack();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* FNF Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[240deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-[2px]" />

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
            OPTIONS & SETTINGS
          </h2>
        </div>
      </header>

      {/* Main Settings Panel */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-[#000000]/80 border-4 border-[#FDE047] shadow-[0_8px_0_#000000] rounded-2xl p-6 sm:p-8 space-y-6 transform -skew-x-2">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="master-volume-slider" className="text-lg font-black text-white uppercase italic">
                Master Volume
              </label>
              <span className="text-base font-extrabold text-[#FDE047] tabular-nums">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              id="master-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(e) => updateSetting("masterVolume", Number(e.target.value))}
              className="w-full h-8 accent-[#E11D48] cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="music-volume-slider" className="text-lg font-black text-white uppercase italic">
                Music Volume
              </label>
              <span className="text-base font-extrabold text-[#38BDF8] tabular-nums">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              id="music-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => updateSetting("musicVolume", Number(e.target.value))}
              className="w-full h-8 accent-[#38BDF8] cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="sfx-volume-slider" className="text-lg font-black text-white uppercase italic">
                Sound Effects (SFX) Volume
              </label>
              <span className="text-base font-extrabold text-[#34D399] tabular-nums">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="sfx-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.sfxVolume}
                onChange={(e) => updateSetting("sfxVolume", Number(e.target.value))}
                className="w-full h-8 accent-[#34D399] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => audio.playConfirm()}
                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#1E2436] border-2 border-[#090B10] text-xs font-black uppercase text-white hover:bg-[#2A334B] shrink-0"
              >
                Test SFX
              </button>
            </div>
          </div>

          {/* Note Scroll Speed */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <label htmlFor="settings-scroll-speed" className="text-lg font-black text-white uppercase italic">
                Note Scroll Speed
              </label>
              <span className="text-base font-extrabold text-[#FDE047] tabular-nums">
                {scrollSpeed} px/s
              </span>
            </div>
            <input
              id="settings-scroll-speed"
              type="range"
              min={MIN_SCROLL_SPEED}
              max={MAX_SCROLL_SPEED}
              step={25}
              value={scrollSpeed}
              onChange={(e) => {
                const spd = Number(e.target.value);
                onScrollSpeedChange(spd);
                updateSetting("scrollSpeed", spd);
              }}
              className="w-full h-8 accent-[#FDE047] cursor-pointer"
            />
            <div className="flex justify-between text-xs font-bold text-gray-300">
              <span>{MIN_SCROLL_SPEED} px/s (Chill)</span>
              <span>{MAX_SCROLL_SPEED} px/s (Insane)</span>
            </div>
          </div>

          {/* Key Bindings */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-lg font-black text-white uppercase italic">
              Key Bindings Layout
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  updateSetting("keyBindings", "arrows");
                  audio.playConfirm();
                }}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-black text-sm uppercase transition-all ${
                  settings.keyBindings === "arrows"
                    ? "bg-[#E11D48] border-white text-white shadow-[0_4px_0_#000]"
                    : "bg-[#1E2436] border-black text-gray-300 hover:bg-[#2A334B]"
                }`}
              >
                Arrow Keys (← ↓ ↑ →)
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSetting("keyBindings", "dfjk");
                  audio.playConfirm();
                }}
                className={`min-h-[48px] p-3 rounded-xl border-2 font-black text-sm uppercase transition-all ${
                  settings.keyBindings === "dfjk"
                    ? "bg-[#0284C7] border-white text-white shadow-[0_4px_0_#000]"
                    : "bg-[#1E2436] border-black text-gray-300 hover:bg-[#2A334B]"
                }`}
              >
                DFJK (D F J K)
              </button>
            </div>
          </div>

          {/* Audio Offset Calibration */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <label htmlFor="audio-offset-slider" className="text-lg font-black text-white uppercase italic">
                Audio Calibration Offset
              </label>
              <span className="text-base font-extrabold text-[#FDE047] tabular-nums">
                {settings.audioOffsetMs > 0 ? `+${settings.audioOffsetMs}` : settings.audioOffsetMs} ms
              </span>
            </div>
            <input
              id="audio-offset-slider"
              type="range"
              min={-150}
              max={150}
              step={5}
              value={settings.audioOffsetMs}
              onChange={(e) => updateSetting("audioOffsetMs", Number(e.target.value))}
              className="w-full h-8 accent-[#E11D48] cursor-pointer"
            />
            <p className="text-xs font-semibold text-gray-300">
              Adjust if notes feel early or late relative to your audio output/Bluetooth latency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Settings are saved automatically to local storage.
      </footer>
    </div>
  );
}
