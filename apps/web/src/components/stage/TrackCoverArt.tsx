import type { ChartDifficulty } from "../../game/types/chart";

interface TrackCoverArtProps {
  chartId: string;
  difficulty: ChartDifficulty;
  bpm: number;
  size?: "sm" | "lg";
}

const DIFFICULTY_PALETTE: Record<
  ChartDifficulty,
  { bg: string; primary: string; secondary: string; accent: string }
> = {
  easy: { bg: "#0F172A", primary: "#38BDF8", secondary: "#0284C7", accent: "#F59E0B" },
  normal: { bg: "#141824", primary: "#E11D48", secondary: "#38BDF8", accent: "#F59E0B" },
  hard: { bg: "#1B1226", primary: "#A855F7", secondary: "#F43F5E", accent: "#FBBF24" },
  expert: { bg: "#1F0D18", primary: "#F43F5E", secondary: "#F59E0B", accent: "#F8FAFC" }
};

export function TrackCoverArt({
  chartId,
  difficulty,
  bpm,
  size = "sm"
}: TrackCoverArtProps) {
  const palette = DIFFICULTY_PALETTE[difficulty];
  const isAlternate = chartId.includes("002") || bpm >= 135;

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={`${
        size === "lg" ? "w-24 h-24 sm:w-28 sm:h-28" : "w-16 h-16"
      } shrink-0 rounded-lg border-2 border-[#090B10] shadow-[0_3px_0_#05070B]`}
    >
      <rect width="120" height="120" fill={palette.bg} />
      <polygon
        points={isAlternate ? "0,120 120,24 120,120" : "0,88 120,40 120,120 0,120"}
        fill={palette.secondary}
        fillOpacity="0.24"
      />
      <circle
        cx="60"
        cy="60"
        r="34"
        fill="#0B0D14"
        stroke={palette.primary}
        strokeWidth="5"
      />
      <circle cx="60" cy="60" r="10" fill={palette.accent} />

      {/* Four mini directional bars referencing the LEFT DOWN UP RIGHT lane colors */}
      <rect x="18" y="96" width="16" height="8" rx="2" fill="#F43F5E" />
      <rect x="40" y="96" width="16" height="8" rx="2" fill="#38BDF8" />
      <rect x="62" y="96" width="16" height="8" rx="2" fill="#F59E0B" />
      <rect x="84" y="96" width="16" height="8" rx="2" fill="#A855F7" />

      <text
        x="60"
        y="22"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="12"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        {bpm} BPM
      </text>
    </svg>
  );
}

