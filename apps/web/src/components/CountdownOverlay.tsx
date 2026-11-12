import { LANE_CONFIG } from "../game/constants";

interface CountdownOverlayProps {
  label: string;
  trackTitle: string;
  onCancel: () => void;
}

export function CountdownOverlay({ label, trackTitle, onCancel }: CountdownOverlayProps) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="absolute inset-0 bg-[#0B0D14]/90 flex flex-col items-center justify-center p-6 text-center z-20"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#CBD5E1] mb-2">
        {trackTitle}
      </p>
      <div className="text-6xl sm:text-7xl font-black tracking-tight text-[#F8FAFC] tabular-nums mb-6 drop-shadow-[0_4px_0_#05070B]">
        {label || "3"}
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
          Arrow Key Lanes
        </p>
        <div className="flex items-center justify-center gap-2">
          {LANE_CONFIG.map((lane) => (
            <div
              key={lane.id}
              className="px-2.5 py-1.5 rounded-md border-2 border-[#090B10] bg-[#141824] flex items-center gap-1.5"
            >
              <span
                className="text-base font-black leading-none"
                style={{ color: lane.textColorOnDark }}
              >
                {lane.symbol}
              </span>
              <span className="text-[11px] font-bold text-[#F8FAFC]">
                {lane.direction}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="min-h-[44px] px-5 py-2 rounded-md bg-[#1E2436] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-sm font-bold text-[#F8FAFC] hover:bg-[#2A334B]"
      >
        Cancel
      </button>
    </div>
  );
}
