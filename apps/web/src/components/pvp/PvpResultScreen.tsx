import { useEffect } from "react";
import type { PvpMatchResult } from "../../hooks/usePvpMatch";
import type { ChartFile } from "../../game/types/chart";
import { BattleCharacter } from "../characters/BattleCharacter";
import { AudioManager } from "../../game/engine/AudioManager";

interface PvpResultScreenProps {
  chart: ChartFile;
  playerId: string;
  result: PvpMatchResult;
  onBackToRoom: () => void;
  onLeaveToLobby: () => void;
}

const REASON_LABELS = {
  hp_zero: "Knockout (HP reached 0)",
  song_complete: "Track Finished (Tie-Break)",
  opponent_forfeit: "Opponent Forfeited"
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
  const audio = AudioManager.getInstance();

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const handleBackToRoom = (): void => {
    audio.playConfirm();
    onBackToRoom();
  };

  const handleLeaveToLobby = (): void => {
    audio.playCancel();
    onLeaveToLobby();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[200deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 max-w-4xl mx-auto w-full flex items-center justify-between">
        <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
          PVP 1V1 RESULTS
        </h2>
        <span
          className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase italic shadow-[0_4px_0_#000] ${
            isDraw
              ? "bg-[#FBBF24] text-black"
              : isWinner
              ? "bg-[#34D399] text-black"
              : "bg-[#E11D48] text-white"
          }`}
        >
          {isDraw ? "DRAW MATCH!" : isWinner ? "VICTORY!!" : "DEFEAT..."}
        </span>
      </header>

      {/* Main Card */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 sm:p-8 space-y-6 transform -skew-x-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-white/10 pb-5">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-[#0284C7] text-white text-xs font-black uppercase">
                {REASON_LABELS[result.reason]}
              </span>
              <h3 className="text-3xl font-black italic text-white uppercase mt-1">
                {chart.title}
              </h3>
              <p className="text-xs font-semibold text-gray-300">
                Difficulty: {chart.difficulty.toUpperCase()} | BPM: {chart.bpm}
              </p>
            </div>

            <div className="flex justify-center shrink-0">
              <BattleCharacter
                role="player"
                name="You"
                state={isWinner || isDraw ? "victory" : "defeat"}
                facing="right"
                compact
              />
            </div>
          </div>

          {/* Dual Player Combat Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums">
            {sortedPlayers.map((player) => {
              const isSelf = player.playerId === playerId;
              const won = result.winnerId === player.playerId;
              const iconSrc = player.slot === 1 ? "/assets/images/icons/icon-bf.png" : "/assets/images/icons/icon-spooky.png";

              return (
                <div
                  key={player.playerId}
                  className={`p-5 rounded-xl border-4 ${
                    won ? "bg-black/75 border-[#34D399]" : "bg-black/60 border-white/20"
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={iconSrc}
                        alt=""
                        className="w-10 h-10 rounded-lg bg-black/40 p-1 object-contain border border-white/20"
                      />
                      <span className="text-xl font-black italic uppercase text-white">
                        {player.playerName} {isSelf ? "(YOU)" : ""}
                      </span>
                    </div>
                    {won && (
                      <span className="px-2.5 py-0.5 rounded bg-[#34D399] text-black text-xs font-black uppercase">
                        WINNER
                      </span>
                    )}
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                      <dt className="text-xs font-black text-gray-400">FINAL HP</dt>
                      <dd className="text-xl font-black text-[#FDE047] mt-0.5">
                        {player.hp} / {player.maxHp}
                      </dd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                      <dt className="text-xs font-black text-gray-400">SCORE</dt>
                      <dd className="text-xl font-black text-white mt-0.5">
                        {player.score.toLocaleString()}
                      </dd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                      <dt className="text-xs font-black text-gray-400">ACCURACY</dt>
                      <dd className="text-lg font-black text-[#34D399] mt-0.5">
                        {player.accuracy.toFixed(1)}%
                      </dd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                      <dt className="text-xs font-black text-gray-400">MAX COMBO</dt>
                      <dd className="text-lg font-black text-[#38BDF8] mt-0.5">
                        {player.maxCombo}x
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleBackToRoom}
              className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] border-2 border-white shadow-[0_4px_0_#000] text-white font-black text-base uppercase italic transition-transform active:translate-y-0.5"
            >
              BACK TO MATCH ROOM
            </button>
            <button
              type="button"
              onClick={handleLeaveToLobby}
              className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-white/30 text-white font-black text-base uppercase italic"
            >
              LEAVE TO PVP LOBBY
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-5 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Challenge your rivals again or host a new room!
      </footer>
    </div>
  );
}
