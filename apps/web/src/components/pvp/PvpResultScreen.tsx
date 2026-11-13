import type { PvpMatchResult } from "../../hooks/usePvpMatch";
import type { ChartFile } from "../../game/types/chart";
import { BattleCharacter } from "../characters/BattleCharacter";

interface PvpResultScreenProps {
  chart: ChartFile;
  playerId: string;
  result: PvpMatchResult;
  onBackToRoom: () => void;
  onLeaveToLobby: () => void;
}

const REASON_LABELS = {
  hp_zero: "Knockout (HP reached 0)",
  song_complete: "Track Finished (Higher HP / Score Tie-Break)",
  opponent_forfeit: "Opponent Left Match"
} as const;

export function PvpResultScreen({
  chart,
  playerId,
  result,
  onBackToRoom,
  onLeaveToLobby
}: PvpResultScreenProps) {
  const isDraw = result.winnerId === null;
  const isWinner = result.winnerId === playerId;
  const sortedPlayers = [...result.players].sort((a, b) => a.slot - b.slot);

  return (
    <section aria-labelledby="pvp-result-heading" className="max-w-4xl w-full mx-auto">
      <div className="p-6 sm:p-8 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_8px_0_#05070B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E2436] pb-5">
          <div className="space-y-1.5">
            <span
              className={`inline-block px-3 py-0.5 rounded border border-[#090B10] text-xs font-black uppercase ${
                isDraw
                  ? "bg-[#FBBF24] text-[#090B10]"
                  : isWinner
                  ? "bg-[#34D399] text-[#090B10]"
                  : "bg-[#FB7185] text-[#090B10]"
              }`}
            >
              {isDraw ? "Draw Match" : isWinner ? "PvP Victory" : "PvP Defeat"}
            </span>
            <h2 id="pvp-result-heading" className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
              {chart.title}
            </h2>
            <p className="text-sm font-semibold text-[#CBD5E1]">
              {REASON_LABELS[result.reason]} | {chart.difficulty.toUpperCase()}
            </p>
          </div>

          <BattleCharacter
            role="player"
            name="You"
            state={isWinner || isDraw ? "victory" : "defeat"}
            facing="right"
            compact
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums">
          {sortedPlayers.map((player) => {
            const isSelf = player.playerId === playerId;
            const won = result.winnerId === player.playerId;
            return (
              <div
                key={player.playerId}
                className={`p-4 rounded-lg bg-[#0B0D14] border-2 ${
                  won ? "border-[#34D399]" : "border-[#090B10]"
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-[#F8FAFC]">
                    {player.playerName} {isSelf ? "(You)" : ""}
                  </span>
                  {won && (
                    <span className="px-2 py-0.5 rounded bg-[#34D399] text-[#090B10] text-[11px] font-black uppercase">
                      Winner
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-bold text-[#94A3B8]">Remaining HP</dt>
                    <dd className="text-lg font-black text-[#F8FAFC]">
                      {player.hp} / {player.maxHp}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-[#94A3B8]">Score</dt>
                    <dd className="text-lg font-black text-[#FBBF24]">
                      {player.score.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-[#94A3B8]">Accuracy</dt>
                    <dd className="text-base font-extrabold text-[#38BDF8]">
                      {player.accuracy.toFixed(1)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-[#94A3B8]">Max Combo</dt>
                    <dd className="text-base font-extrabold text-[#F8FAFC]">
                      {player.maxCombo}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToRoom}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-white font-black uppercase text-sm"
          >
            Return to Match Room
          </button>
          <button
            type="button"
            onClick={onLeaveToLobby}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-[#F8FAFC] font-extrabold uppercase text-sm"
          >
            Back to PvP Lobby
          </button>
        </div>
      </div>
    </section>
  );
}

