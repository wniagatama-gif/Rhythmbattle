import { useState } from "react";
import type { PvpPlayerSnapshot, PvpRoomSnapshot } from "@rhythm-battle/shared";
import type { ChartFile } from "../../game/types/chart";
import { CharacterAvatarIcon } from "../characters/BattleCharacter";

interface PvpLobbyScreenProps {
  charts: ChartFile[];
  selectedChartId: string;
  connected: boolean;
  connecting: boolean;
  playerId: string;
  playerName: string;
  pingMs: number | null;
  searching: boolean;
  room: PvpRoomSnapshot | null;
  error: string | null;
  onConnect: (name: string) => void;
  onDisconnect: () => void;
  onQuickMatch: (chartId?: string) => void;
  onCreateRoom: (chartId: string) => void;
  onJoinRoom: (roomCode: string) => void;
  onSelectChart: (chartId: string) => void;
  onSetReady: (ready: boolean) => void;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
  onDismissError: () => void;
}

export function PvpLobbyScreen({
  charts,
  selectedChartId,
  connected,
  connecting,
  playerId,
  playerName,
  pingMs,
  searching,
  room,
  error,
  onConnect,
  onDisconnect,
  onQuickMatch,
  onCreateRoom,
  onJoinRoom,
  onSelectChart,
  onSetReady,
  onStartMatch,
  onLeaveRoom,
  onDismissError
}: PvpLobbyScreenProps) {
  const [nameInput, setNameInput] = useState<string>(playerName);
  const [roomCodeInput, setRoomCodeInput] = useState<string>("");

  const self: PvpPlayerSnapshot | undefined = room?.players.find((p) => p.playerId === playerId);
  const isHost = room?.hostId === playerId;
  const bothReady =
    Boolean(room) &&
    room!.players.length === 2 &&
    room!.players.every((p) => p.ready && p.connected);
  const activeRoomChart = charts.find((c) => c.id === room?.chartId) ?? charts[0];

  return (
    <section aria-labelledby="pvp-lobby-heading" className="space-y-6">
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#2A1118] border-2 border-[#F43F5E] text-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-extrabold uppercase text-[#FB7185]">Online PvP Notice</p>
            <p className="text-sm text-[#F8FAFC]">{error}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="min-h-[44px] px-4 py-2 rounded-md bg-[#141824] border-2 border-[#090B10] text-sm font-bold text-[#F8FAFC] hover:bg-[#1E2436] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection & Player Identity Bar */}
      <div className="p-5 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 id="pvp-lobby-heading" className="text-xl font-black uppercase text-[#F8FAFC]">
            Online Player VS Player
          </h2>
          <p className="text-sm text-[#CBD5E1]">
            Real-time 1v1 rhythm combat over WebSocket with server-authoritative HP, damage, and Special Attacks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
          <div className="space-y-1">
            <label htmlFor="pvp-player-name" className="block text-xs font-bold uppercase text-[#CBD5E1]">
              Player Name
            </label>
            <input
              id="pvp-player-name"
              type="text"
              maxLength={24}
              value={nameInput}
              disabled={connected}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Name"
              className="min-h-[44px] px-3 py-2 rounded-md bg-[#0B0D14] border-2 border-[#090B10] text-sm font-bold text-[#F8FAFC] disabled:opacity-70"
            />
          </div>

          {!connected ? (
            <button
              type="button"
              disabled={connecting}
              onClick={() => onConnect(nameInput)}
              className="min-h-[44px] px-5 py-2 rounded-md bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_3px_0_#05070B] text-sm font-black uppercase text-white disabled:opacity-60"
            >
              {connecting ? "Connecting..." : "Connect Online"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="min-h-[44px] px-3 rounded-md bg-[#0B0D14] border-2 border-[#090B10] flex items-center gap-2 text-xs font-bold text-[#34D399] tabular-nums">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                <span>Online{pingMs !== null ? ` (${pingMs} ms)` : ""}</span>
              </div>
              <button
                type="button"
                onClick={onDisconnect}
                className="min-h-[44px] px-3.5 py-2 rounded-md bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] text-xs font-extrabold uppercase text-[#F8FAFC]"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {!connected ? (
        <div className="p-8 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] text-center space-y-2">
          <p className="text-base font-extrabold text-[#F8FAFC]">
            Connect to the Online PvP Server to Matchmake
          </p>
          <p className="text-sm text-[#CBD5E1]">
            Enter your nickname above and click Connect Online, then open a second browser window or invite a friend via Room Code.
          </p>
        </div>
      ) : room ? (
        /* Active Match Room */
        <div className="p-6 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E2436] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded border border-[#090B10] bg-[#0B0D14] text-xs font-black uppercase text-[#FBBF24]">
                  {room.mode === "quick" ? "Quick Match Room" : "Private Room"}
                </span>
                <span className="px-2.5 py-0.5 rounded border border-[#090B10] bg-[#1E2436] text-xs font-black tracking-widest text-[#38BDF8]">
                  CODE: {room.roomCode}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#F8FAFC]">
                Track: {activeRoomChart?.title ?? room.chartId} ({activeRoomChart?.difficulty.toUpperCase()})
              </h3>
            </div>

            <button
              type="button"
              onClick={onLeaveRoom}
              className="min-h-[44px] px-4 py-2 rounded-md bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] text-xs font-extrabold uppercase text-[#F8FAFC] shrink-0"
            >
              Leave Room
            </button>
          </div>

          {/* Host Chart Selector */}
          {isHost && room.mode === "private" && (
            <div className="space-y-2">
              <label htmlFor="room-chart-select" className="block text-xs font-extrabold uppercase tracking-wider text-[#CBD5E1]">
                Select Match Track (Host)
              </label>
              <select
                id="room-chart-select"
                value={room.chartId}
                onChange={(e) => onSelectChart(e.target.value)}
                className="w-full sm:w-auto min-h-[44px] px-3 py-2 rounded-md bg-[#0B0D14] border-2 border-[#090B10] text-sm font-bold text-[#F8FAFC]"
              >
                {charts.map((chart) => (
                  <option key={chart.id} value={chart.id}>
                    {chart.title} [{chart.difficulty.toUpperCase()} - {chart.bpm} BPM]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Player Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((slot) => {
              const occupant = room.players.find((p) => p.slot === slot);
              const isSelf = occupant?.playerId === playerId;
              return (
                <div
                  key={slot}
                  className={`p-4 rounded-lg border-2 border-[#090B10] ${
                    occupant ? "bg-[#0B0D14]" : "bg-[#0B0D14]/50 border-dashed border-[#334155]"
                  } flex items-center justify-between gap-3`}
                >
                  {occupant ? (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <CharacterAvatarIcon role={slot === 1 ? "player" : "opponent"} size={42} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#F8FAFC] truncate">
                              {occupant.playerName}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1E2436] text-[10px] font-bold text-[#FBBF24]">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#CBD5E1]">
                            Slot {slot} | {occupant.connected ? "Connected" : "Reconnecting..."}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded border border-[#090B10] text-xs font-black uppercase ${
                          occupant.ready
                            ? "bg-[#34D399] text-[#090B10]"
                            : "bg-[#1E2436] text-[#CBD5E1]"
                        }`}
                      >
                        {occupant.ready ? "Ready" : "Waiting"}
                      </span>
                    </>
                  ) : (
                    <div className="w-full text-center py-2 text-sm font-semibold text-[#94A3B8]">
                      Waiting for Player 2 to join with code <span className="text-[#38BDF8] font-black">{room.roomCode}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ready & Start Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onSetReady(!(self?.ready ?? false))}
              className={`flex-1 min-h-[48px] px-5 py-3 rounded-lg border-2 border-[#090B10] shadow-[0_4px_0_#05070B] font-black uppercase text-sm ${
                self?.ready
                  ? "bg-[#1E2436] hover:bg-[#2A334B] text-[#F8FAFC]"
                  : "bg-[#0284C7] hover:bg-[#0369A1] text-white"
              }`}
            >
              {self?.ready ? "Cancel Ready" : "Ready Up"}
            </button>

            {room.mode === "private" && isHost && (
              <button
                type="button"
                disabled={!bothReady}
                onClick={onStartMatch}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] disabled:opacity-50 text-white font-black uppercase text-sm"
              >
                {bothReady ? "Start PvP Battle" : "Waiting for Both Ready"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Matchmaking Options: Quick Match & Private Room */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Match */}
          <div className="p-6 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded border border-[#090B10] bg-[#0B0D14] text-[11px] font-black uppercase text-[#FBBF24]">
                Automatic Pairing
              </span>
              <h3 className="text-xl font-black text-[#F8FAFC]">Quick Match</h3>
              <p className="text-sm text-[#CBD5E1]">
                Queue up and get paired automatically with another online challenger for a synchronized 1v1 battle.
              </p>
            </div>

            {searching ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0B0D14] border-2 border-[#38BDF8] text-sm font-bold text-[#38BDF8] text-center">
                  Searching for an online opponent...
                </div>
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] text-sm font-extrabold uppercase text-[#F8FAFC]"
                >
                  Cancel Search
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onQuickMatch(selectedChartId)}
                className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-white font-black uppercase text-sm"
              >
                Find Quick Match
              </button>
            )}
          </div>

          {/* Private Room */}
          <div className="p-6 rounded-xl bg-[#141824] border-2 border-[#090B10] shadow-[0_6px_0_#05070B] space-y-5">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded border border-[#090B10] bg-[#0B0D14] text-[11px] font-black uppercase text-[#38BDF8]">
                Invite via Code
              </span>
              <h3 className="text-xl font-black text-[#F8FAFC]">Private Room</h3>
              <p className="text-sm text-[#CBD5E1]">
                Create a private battle room and share the 6-character code, or enter a friend&apos;s room code below.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCreateRoom(selectedChartId)}
              className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] border-2 border-[#090B10] shadow-[0_4px_0_#05070B] text-white font-black uppercase text-sm"
            >
              Create Private Room
            </button>

            <div className="pt-2 border-t border-[#1E2436] flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={8}
                aria-label="Room code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Room Code (e.g. A7K9M2)"
                className="flex-1 min-h-[44px] px-3 py-2 rounded-md bg-[#0B0D14] border-2 border-[#090B10] text-sm font-black uppercase tracking-wider text-[#F8FAFC]"
              />
              <button
                type="button"
                disabled={roomCodeInput.trim().length < 4}
                onClick={() => onJoinRoom(roomCodeInput.trim())}
                className="min-h-[44px] px-5 py-2 rounded-md bg-[#1E2436] hover:bg-[#2A334B] border-2 border-[#090B10] disabled:opacity-50 text-sm font-extrabold uppercase text-[#F8FAFC]"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

