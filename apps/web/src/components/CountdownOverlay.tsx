import { useEffect, useRef } from "react";
import { LANE_CONFIG } from "../game/constants";

interface CountdownOverlayProps {
  label: string;
  trackTitle: string;
  onCancel: () => void;
}

const COUNTDOWN_SOUNDS: Record<string, string> = {
  "3": "/assets/sounds/countdown/introTHREE.ogg",
  "2": "/assets/sounds/countdown/introTWO.ogg",
  "1": "/assets/sounds/countdown/introONE.ogg",
  "BATTLE!": "/assets/sounds/countdown/introGO.ogg",
  "GO!": "/assets/sounds/countdown/introGO.ogg"
};

const COUNTDOWN_IMAGES: Record<string, string> = {
  "2": "/assets/images/ui/countdown/ready.png",
  "1": "/assets/images/ui/countdown/set.png",
  "GO!": "/assets/images/ui/countdown/go.png",
  "BATTLE!": "/assets/images/ui/countdown/go.png"
};

export function CountdownOverlay({ label, trackTitle, onCancel }: CountdownOverlayProps) {
  const lastSoundRef = useRef<string>("");

  useEffect(() => {
    const soundUrl = COUNTDOWN_SOUNDS[label];
    if (soundUrl && soundUrl !== lastSoundRef.current) {
      lastSoundRef.current = soundUrl;
      const audio = new Audio(soundUrl);
      audio.volume = 0.85;
      audio.play().catch(() => {});
    }
  }, [label]);

  const countdownImage = COUNTDOWN_IMAGES[label];

  return (
    <div
      role="status"
      aria-live="assertive"
      className="absolute inset-0 bg-[#0B0D14]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-20 select-none"
    >
      <p className="text-sm font-black uppercase italic tracking-widest text-[#FDE047] drop-shadow-[0_2px_0_#000] mb-4">
        {trackTitle}
      </p>

      {/* Official FNF Countdown Image or Number */}
      <div className="h-32 flex items-center justify-center mb-6">
        {countdownImage ? (
          <img
            src={countdownImage}
            alt={label}
            className="h-28 sm:h-32 object-contain drop-shadow-[0_6px_0_rgba(0,0,0,0.9)] animate-bounce"
          />
        ) : (
          <div className="text-7xl sm:text-8xl font-black italic tracking-tighter text-[#F8FAFC] drop-shadow-[0_6px_0_#000000] animate-pulse">
            {label || "3"}
          </div>
        )}
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-xs font-black uppercase italic tracking-wider text-gray-300">
          Highway Key Controls
        </p>
        <div className="flex items-center justify-center gap-2">
          {LANE_CONFIG.map((lane) => (
            <div
              key={lane.id}
              className="px-3 py-1.5 rounded-lg border-2 border-white/20 bg-black/60 flex items-center gap-1.5 shadow-[0_2px_0_#000]"
            >
              <span
                className="text-lg font-black leading-none"
                style={{ color: lane.textColorOnDark }}
              >
                {lane.symbol}
              </span>
              <span className="text-[11px] font-black uppercase text-white">
                {lane.direction}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="min-h-[44px] px-5 py-2 rounded-xl bg-black/60 hover:bg-black/90 border-2 border-white/30 text-xs font-black uppercase tracking-wider text-white transition-transform active:translate-y-0.5"
      >
        Cancel Battle (ESC)
      </button>
    </div>
  );
}
