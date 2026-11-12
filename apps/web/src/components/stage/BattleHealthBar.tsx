import { CharacterAvatarIcon } from "../characters/BattleCharacter";

export interface BattleHealthBarProps {
  playerName: string;
  opponentName: string;
  playerHp: number;
  opponentHp: number;
  maxHp?: number;
}

export function BattleHealthBar({
  playerName,
  opponentName,
  playerHp,
  opponentHp,
  maxHp = 100
}: BattleHealthBarProps) {
  const safeTotal = Math.max(1, playerHp + opponentHp);
  const playerSharePct = Math.max(8, Math.min(92, (playerHp / safeTotal) * 100));
  const playerPctOfMax = Math.max(0, Math.min(100, Math.round((playerHp / maxHp) * 100)));
  const opponentPctOfMax = Math.max(0, Math.min(100, Math.round((opponentHp / maxHp) * 100)));

  return (
    <div
      role="region"
      aria-label="Battle health bar"
      className="w-full max-w-2xl mx-auto flex items-center gap-2.5"
    >
      <CharacterAvatarIcon role="player" size={38} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1 px-0.5">
          <span className="text-[#FB7185] truncate">
            {playerName} ({playerPctOfMax}%)
          </span>
          <span className="text-[#38BDF8] truncate text-right">
            {opponentName} ({opponentPctOfMax}%)
          </span>
        </div>

        <div className="relative h-4 w-full rounded-md border-2 border-[#090B10] bg-[#0284C7] overflow-hidden shadow-[0_3px_0_#05070B]">
          {/* Player Side Fill (Crimson) pushing from left toward opponent */}
          <div
            className="h-full bg-[#E11D48] transition-all duration-300 ease-out border-r-2 border-[#F8FAFC]"
            style={{ width: `${playerSharePct}%` }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-[#090B10]/60"
          />
        </div>
      </div>

      <CharacterAvatarIcon role="opponent" size={38} />
    </div>
  );
}

