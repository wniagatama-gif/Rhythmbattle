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
      className="absolute inset-0 bg-[#111318]/90 flex flex-col items-center justify-center p-6 text-center z-10 rounded-lg"
    >
      <p className="text-sm font-medium text-[#A8B0BF] mb-2">{trackTitle}</p>
      <div className="text-5xl font-bold tracking-tight text-[#F3F4F6] tabular-nums mb-6">
        {label || "3"}
      </div>
      <p className="text-sm text-[#A8B0BF] mb-6">
        Get ready on Arrow Keys: Left, Right, Up, Down
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[44px] px-5 py-2 rounded-md bg-[#181B22] border border-[#64748B] text-sm font-medium text-[#F3F4F6] hover:bg-[#20242E]"
      >
        Cancel
      </button>
    </div>
  );
}

