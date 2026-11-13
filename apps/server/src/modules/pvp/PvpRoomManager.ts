import { RAW_CHART_FILES } from "@rhythm-battle/game-data";
import {
  ChartFileSchema,
  DEFAULT_GAME_CONFIG,
  INITIAL_SCORE_STATE,
  JUDGEMENT_SCORE,
  PVP_COMBAT_CONFIG,
  PvpClientMessageSchema,
  type ChartFile,
  type JudgementType,
  type PvpFinishReason,
  type PvpMatchState,
  type PvpPlayerSnapshot,
  type PvpRoomSnapshot,
  type PvpServerMessage
} from "@rhythm-battle/shared";

export type PvpSendFn = (message: PvpServerMessage) => void;

interface PlayerRuntimeState {
  playerId: string;
  playerName: string;
  slot: 1 | 2;
  connected: boolean;
  ready: boolean;
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  judgedNotes: number;
  counts: Record<JudgementType, number>;
  lastSpecialAtMs: number;
  judgedNoteIndices: Set<number>;
  songEnded: boolean;
}

interface RoomRuntimeState {
  roomId: string;
  roomCode: string;
  mode: "quick" | "private";
  hostId: string;
  chart: ChartFile;
  matchId: string | null;
  matchState: PvpMatchState;
  scheduledStartServerMs: number | null;
  players: Map<string, PlayerRuntimeState>;
}

interface ConnectedClient {
  playerId: string;
  playerName: string;
  roomId: string | null;
  send: PvpSendFn;
}

function getScoreMultiplier(combo: number): number {
  if (combo >= 50) return 4;
  if (combo >= 25) return 3;
  if (combo >= 10) return 2;
  return 1;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)] ?? "A";
  }
  return code;
}

export class PvpRoomManager {
  private readonly charts = new Map<string, ChartFile>();
  private readonly defaultChart: ChartFile;
  private readonly clients = new Map<string, ConnectedClient>();
  private readonly connectionToPlayer = new Map<string, string>();
  private readonly rooms = new Map<string, RoomRuntimeState>();
  private readonly roomByCode = new Map<string, string>();
  private readonly quickQueue: string[] = [];
  private readonly countdownMs: number;

  constructor(options?: { countdownMs?: number }) {
    this.countdownMs = options?.countdownMs ?? 3000;
    let fallback: ChartFile | null = null;
    for (const raw of RAW_CHART_FILES) {
      const parsed = ChartFileSchema.safeParse(raw);
      if (parsed.success) {
        const sortedNotes = [...parsed.data.notes].sort((a, b) =>
          a.time !== b.time ? a.time - b.time : a.lane - b.lane
        );
        const chart: ChartFile = { ...parsed.data, notes: sortedNotes };
        this.charts.set(chart.id, chart);
        if (!fallback) {
          fallback = chart;
        }
      }
    }
    if (!fallback) {
      throw new Error("No valid charts available for PvP server.");
    }
    this.defaultChart = fallback;
  }

  registerConnection(connectionId: string, send: PvpSendFn): void {
    this.connectionToPlayer.set(connectionId, connectionId);
    this.clients.set(connectionId, {
      playerId: connectionId,
      playerName: `Player-${connectionId.slice(0, 4)}`,
      roomId: null,
      send
    });
  }

  private resolvePlayerId(connectionId: string): string {
    return this.connectionToPlayer.get(connectionId) ?? connectionId;
  }

  handleRawMessage(connectionId: string, rawPayload: unknown): void {
    const playerId = this.resolvePlayerId(connectionId);
    let parsedJson: unknown = rawPayload;
    if (typeof rawPayload === "string") {
      try {
        parsedJson = JSON.parse(rawPayload);
      } catch {
        this.sendError(playerId, "INVALID_JSON", "Malformed JSON payload.");
        return;
      }
    }

    const parsed = PvpClientMessageSchema.safeParse(parsedJson);
    if (!parsed.success) {
      this.sendError(playerId, "INVALID_MESSAGE", "Unsupported or invalid PvP message.");
      return;
    }

    const msg = parsed.data;
    switch (msg.type) {
      case "hello":
        this.handleHello(connectionId, msg.playerName, msg.playerId);
        break;
      case "ping":
        this.clients.get(playerId)?.send({
          type: "pong",
          clientTimeMs: msg.clientTimeMs,
          serverTimeMs: Date.now()
        });
        break;
      case "quick_match":
        this.handleQuickMatch(playerId, msg.chartId);
        break;
      case "create_room":
        this.handleCreateRoom(playerId, msg.chartId);
        break;
      case "join_room":
        this.handleJoinRoom(playerId, msg.roomCode.toUpperCase());
        break;
      case "select_chart":
        this.handleSelectChart(playerId, msg.chartId);
        break;
      case "set_ready":
        this.handleSetReady(playerId, msg.ready);
        break;
      case "start_match":
        this.handleStartMatch(playerId);
        break;
      case "note_input":
        this.handleNoteInput(playerId, msg.lane, msg.songTimeSec);
        break;
      case "note_miss_timeout":
        this.handleNoteMissTimeout(playerId, msg.noteIndex);
        break;
      case "special_attack":
        this.handleSpecialAttack(playerId);
        break;
      case "match_song_ended":
        this.handleSongEnded(playerId);
        break;
      case "leave_room":
        this.handleLeaveRoom(playerId);
        break;
    }
  }

  handleDisconnect(connectionId: string): void {
    const playerId = this.resolvePlayerId(connectionId);
    this.connectionToPlayer.delete(connectionId);
    const client = this.clients.get(playerId);
    if (!client) {
      return;
    }

    this.removeFromQueue(client.playerId);

    if (client.roomId) {
      const room = this.rooms.get(client.roomId);
      const player = room?.players.get(client.playerId);
      if (room && player) {
        player.connected = false;
        this.broadcastToRoom(room, {
          type: "opponent_connection",
          playerId: player.playerId,
          connected: false
        });
        this.broadcastRoomState(room);
      }
    }

    this.clients.delete(playerId);
  }

  private handleHello(connectionId: string, playerName: string, requestedPlayerId?: string): void {
    const currentId = this.resolvePlayerId(connectionId);
    const client = this.clients.get(currentId);
    if (!client) {
      return;
    }

    const playerId = requestedPlayerId && requestedPlayerId.trim().length > 0
      ? requestedPlayerId.trim()
      : currentId;

    if (playerId !== currentId) {
      this.clients.delete(currentId);
      client.playerId = playerId;
      this.clients.set(playerId, client);
      this.connectionToPlayer.set(connectionId, playerId);
    }

    client.playerName = playerName;

    // Restore active room membership on reconnect if player belongs to an existing room.
    for (const room of this.rooms.values()) {
      const existingPlayer = room.players.get(playerId);
      if (existingPlayer) {
        existingPlayer.connected = true;
        existingPlayer.playerName = playerName;
        client.roomId = room.roomId;
        client.send({
          type: "welcome",
          playerId,
          playerName,
          serverTimeMs: Date.now()
        });
        this.broadcastToRoom(room, {
          type: "opponent_connection",
          playerId,
          connected: true
        });
        this.broadcastRoomState(room);
        return;
      }
    }

    client.send({
      type: "welcome",
      playerId,
      playerName,
      serverTimeMs: Date.now()
    });
  }

  private handleQuickMatch(playerId: string, preferredChartId?: string): void {
    const client = this.clients.get(playerId);
    if (!client) {
      return;
    }

    this.handleLeaveRoom(playerId);
    this.removeFromQueue(playerId);

    const waitingOpponentId = this.quickQueue.find(
      (queuedId) => queuedId !== playerId && this.clients.has(queuedId)
    );

    if (!waitingOpponentId) {
      this.quickQueue.push(playerId);
      client.send({ type: "matchmaking_status", status: "searching" });
      return;
    }

    this.removeFromQueue(waitingOpponentId);
    const opponent = this.clients.get(waitingOpponentId);
    if (!opponent) {
      this.quickQueue.push(playerId);
      client.send({ type: "matchmaking_status", status: "searching" });
      return;
    }

    const chart = (preferredChartId ? this.charts.get(preferredChartId) : undefined) ?? this.defaultChart;
    const room = this.createRoomInternal(waitingOpponentId, opponent.playerName, chart, "quick");
    this.addPlayerToRoom(room, playerId, client.playerName, 2);

    opponent.roomId = room.roomId;
    client.roomId = room.roomId;

    opponent.send({ type: "matchmaking_status", status: "idle" });
    client.send({ type: "matchmaking_status", status: "idle" });
    this.broadcastRoomState(room);
  }

  private handleCreateRoom(playerId: string, chartId: string): void {
    const client = this.clients.get(playerId);
    if (!client) {
      return;
    }

    this.handleLeaveRoom(playerId);
    this.removeFromQueue(playerId);

    const chart = this.charts.get(chartId) ?? this.defaultChart;
    const room = this.createRoomInternal(playerId, client.playerName, chart, "private");
    client.roomId = room.roomId;
    this.broadcastRoomState(room);
  }

  private handleJoinRoom(playerId: string, roomCode: string): void {
    const client = this.clients.get(playerId);
    if (!client) {
      return;
    }

    const roomId = this.roomByCode.get(roomCode);
    const room = roomId ? this.rooms.get(roomId) : undefined;
    if (!room) {
      this.sendError(playerId, "ROOM_NOT_FOUND", `Room code "${roomCode}" was not found.`);
      return;
    }

    if (room.players.size >= 2 && !room.players.has(playerId)) {
      this.sendError(playerId, "ROOM_FULL", "This room already has two players.");
      return;
    }

    this.handleLeaveRoom(playerId);
    this.removeFromQueue(playerId);

    if (!room.players.has(playerId)) {
      this.addPlayerToRoom(room, playerId, client.playerName, 2);
    }
    client.roomId = room.roomId;
    this.broadcastRoomState(room);
  }

  private handleSelectChart(playerId: string, chartId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || room.hostId !== playerId || room.matchState !== "lobby") {
      return;
    }
    const chart = this.charts.get(chartId);
    if (!chart) {
      this.sendError(playerId, "CHART_NOT_FOUND", "Selected chart does not exist.");
      return;
    }
    room.chart = chart;
    for (const player of room.players.values()) {
      player.ready = false;
    }
    this.broadcastRoomState(room);
  }

  private handleSetReady(playerId: string, ready: boolean): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || room.matchState !== "lobby") {
      return;
    }
    const player = room.players.get(playerId);
    if (!player) {
      return;
    }
    player.ready = ready;
    this.broadcastRoomState(room);

    // Quick match starts automatically as soon as both players are ready.
    if (
      room.mode === "quick" &&
      room.players.size === 2 &&
      Array.from(room.players.values()).every((p) => p.ready && p.connected)
    ) {
      this.scheduleMatchStart(room);
    }
  }

  private handleStartMatch(playerId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || room.hostId !== playerId || room.matchState !== "lobby") {
      return;
    }
    if (room.players.size < 2) {
      this.sendError(playerId, "NEED_OPPONENT", "Two players are required to start an Online PvP match.");
      return;
    }
    const allReady = Array.from(room.players.values()).every((p) => p.ready && p.connected);
    if (!allReady) {
      this.sendError(playerId, "PLAYERS_NOT_READY", "Both players must be ready before starting.");
      return;
    }
    this.scheduleMatchStart(room);
  }

  private scheduleMatchStart(room: RoomRuntimeState): void {
    room.matchId = crypto.randomUUID();
    room.matchState = "countdown";
    room.scheduledStartServerMs = Date.now() + this.countdownMs;

    for (const player of room.players.values()) {
      player.hp = PVP_COMBAT_CONFIG.initialHp;
      player.maxHp = PVP_COMBAT_CONFIG.maxHp;
      player.score = 0;
      player.combo = 0;
      player.maxCombo = 0;
      player.accuracy = 100;
      player.judgedNotes = 0;
      player.counts = { ...INITIAL_SCORE_STATE.counts };
      player.lastSpecialAtMs = 0;
      player.judgedNoteIndices.clear();
      player.songEnded = false;
    }

    const snapshot = this.toRoomSnapshot(room);
    this.broadcastToRoom(room, {
      type: "match_scheduled",
      room: snapshot,
      matchId: room.matchId,
      chartId: room.chart.id,
      chartVersion: "1.0",
      scheduledStartServerMs: room.scheduledStartServerMs,
      serverTimeMs: Date.now()
    });
  }

  private ensurePlayingState(room: RoomRuntimeState): boolean {
    if (room.matchState === "playing") {
      return true;
    }
    if (
      room.matchState === "countdown" &&
      room.scheduledStartServerMs !== null &&
      Date.now() >= room.scheduledStartServerMs - 500
    ) {
      room.matchState = "playing";
      return true;
    }
    return false;
  }

  private handleNoteInput(playerId: string, lane: number, songTimeSec: number): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || !this.ensurePlayingState(room)) {
      return;
    }
    const player = room.players.get(playerId);
    const opponent = this.getOpponent(room, playerId);
    if (!player || !opponent) {
      return;
    }

    let bestIndex = -1;
    let bestAbsDeltaMs = Infinity;
    let bestDeltaMs = 0;
    const maxWindowMs = DEFAULT_GAME_CONFIG.hitWindowMs.miss;

    for (let i = 0; i < room.chart.notes.length; i += 1) {
      if (player.judgedNoteIndices.has(i)) {
        continue;
      }
      const note = room.chart.notes[i];
      if (!note || note.lane !== lane) {
        continue;
      }
      const deltaMs = (songTimeSec - note.time) * 1000;
      const absDeltaMs = Math.abs(deltaMs);
      if (absDeltaMs <= maxWindowMs && absDeltaMs < bestAbsDeltaMs) {
        bestAbsDeltaMs = absDeltaMs;
        bestDeltaMs = deltaMs;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) {
      return;
    }

    let judgement: JudgementType = "MISS";
    const windows = DEFAULT_GAME_CONFIG.hitWindowMs;
    if (bestAbsDeltaMs <= windows.perfect) {
      judgement = "PERFECT";
    } else if (bestAbsDeltaMs <= windows.great) {
      judgement = "GREAT";
    } else if (bestAbsDeltaMs <= windows.good) {
      judgement = "GOOD";
    }

    this.applyJudgement(room, player, opponent, bestIndex, lane, judgement, bestDeltaMs);
  }

  private handleNoteMissTimeout(playerId: string, noteIndex: number): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || !this.ensurePlayingState(room)) {
      return;
    }
    const player = room.players.get(playerId);
    const opponent = this.getOpponent(room, playerId);
    const note = room.chart.notes[noteIndex];
    if (!player || !opponent || !note || player.judgedNoteIndices.has(noteIndex)) {
      return;
    }

    this.applyJudgement(room, player, opponent, noteIndex, note.lane, "MISS", 180);
  }

  private applyJudgement(
    room: RoomRuntimeState,
    player: PlayerRuntimeState,
    opponent: PlayerRuntimeState,
    noteIndex: number,
    lane: number,
    judgement: JudgementType,
    timingDeltaMs: number
  ): void {
    player.judgedNoteIndices.add(noteIndex);
    player.judgedNotes += 1;
    player.counts[judgement] += 1;

    if (judgement === "MISS") {
      player.combo = 0;
    } else {
      const mult = getScoreMultiplier(player.combo);
      player.combo += 1;
      player.maxCombo = Math.max(player.maxCombo, player.combo);
      player.score += JUDGEMENT_SCORE[judgement] * mult;
    }

    if (player.judgedNotes > 0) {
      player.accuracy = Number(((player.counts.PERFECT / player.judgedNotes) * 100).toFixed(1));
    }

    const damageDealt = PVP_COMBAT_CONFIG.damageDealt[judgement];
    const selfDamage = PVP_COMBAT_CONFIG.selfDamage[judgement];

    if (damageDealt > 0) {
      opponent.hp = Math.max(0, opponent.hp - damageDealt);
    }
    if (selfDamage > 0) {
      player.hp = Math.max(0, player.hp - selfDamage);
    }

    const snapshots = this.toPlayerSnapshots(room);
    this.broadcastToRoom(room, {
      type: "note_judged",
      playerId: player.playerId,
      noteIndex,
      lane,
      judgement,
      timingDeltaMs,
      damageDealt,
      selfDamage,
      players: snapshots
    });

    if (opponent.hp <= 0) {
      this.finishMatch(room, player.playerId, "hp_zero");
    } else if (player.hp <= 0) {
      this.finishMatch(room, opponent.playerId, "hp_zero");
    }
  }

  private handleSpecialAttack(playerId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || !this.ensurePlayingState(room)) {
      return;
    }
    const attacker = room.players.get(playerId);
    const defender = this.getOpponent(room, playerId);
    if (!attacker || !defender) {
      return;
    }

    const now = Date.now();
    const { comboThreshold, cooldownMs, damage } = PVP_COMBAT_CONFIG.specialAttack;
    if (attacker.combo < comboThreshold) {
      this.sendError(playerId, "SPECIAL_NOT_READY", `Need ${comboThreshold} combo to trigger Special Attack.`);
      return;
    }
    if (attacker.lastSpecialAtMs > 0 && now - attacker.lastSpecialAtMs < cooldownMs) {
      this.sendError(playerId, "SPECIAL_COOLDOWN", "Special Attack is still on cooldown.");
      return;
    }

    attacker.lastSpecialAtMs = now;
    defender.hp = Math.max(0, defender.hp - damage);

    const snapshots = this.toPlayerSnapshots(room);
    this.broadcastToRoom(room, {
      type: "special_triggered",
      attackerId: attacker.playerId,
      defenderId: defender.playerId,
      damage,
      players: snapshots
    });

    if (defender.hp <= 0) {
      this.finishMatch(room, attacker.playerId, "hp_zero");
    }
  }

  private handleSongEnded(playerId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room || room.matchState !== "playing") {
      return;
    }
    const player = room.players.get(playerId);
    if (!player) {
      return;
    }
    player.songEnded = true;

    const allEnded = Array.from(room.players.values()).every((p) => p.songEnded || !p.connected);
    if (!allEnded) {
      return;
    }

    const players = Array.from(room.players.values());
    const p1 = players[0];
    const p2 = players[1];
    let winnerId: string | null = null;

    if (p1 && p2) {
      if (p1.hp !== p2.hp) {
        winnerId = p1.hp > p2.hp ? p1.playerId : p2.playerId;
      } else if (p1.score !== p2.score) {
        winnerId = p1.score > p2.score ? p1.playerId : p2.playerId;
      }
    }

    this.finishMatch(room, winnerId, "song_complete");
  }

  private finishMatch(room: RoomRuntimeState, winnerId: string | null, reason: PvpFinishReason): void {
    if (room.matchState === "finished") {
      return;
    }
    room.matchState = "finished";
    const snapshots = this.toPlayerSnapshots(room);
    this.broadcastToRoom(room, {
      type: "match_finished",
      matchId: room.matchId ?? "",
      winnerId,
      reason,
      players: snapshots
    });

    // Reset readiness so players can rematch in the same room if desired.
    for (const player of room.players.values()) {
      player.ready = false;
    }
    room.matchState = "lobby";
    room.matchId = null;
    room.scheduledStartServerMs = null;
  }

  private handleLeaveRoom(playerId: string): void {
    const client = this.clients.get(playerId);
    if (!client || !client.roomId) {
      return;
    }

    const room = this.rooms.get(client.roomId);
    client.roomId = null;
    if (!room) {
      return;
    }

    const opponent = this.getOpponent(room, playerId);
    if ((room.matchState === "playing" || room.matchState === "countdown") && opponent) {
      this.finishMatch(room, opponent.playerId, "opponent_forfeit");
    }

    room.players.delete(playerId);
    if (room.players.size === 0) {
      this.rooms.delete(room.roomId);
      this.roomByCode.delete(room.roomCode);
      return;
    }

    const remaining = Array.from(room.players.values())[0];
    if (remaining) {
      room.hostId = remaining.playerId;
      remaining.slot = 1;
      remaining.ready = false;
    }
    this.broadcastRoomState(room);
  }

  private createRoomInternal(
    hostId: string,
    hostName: string,
    chart: ChartFile,
    mode: "quick" | "private"
  ): RoomRuntimeState {
    let code = generateRoomCode();
    while (this.roomByCode.has(code)) {
      code = generateRoomCode();
    }

    const room: RoomRuntimeState = {
      roomId: crypto.randomUUID(),
      roomCode: code,
      mode,
      hostId,
      chart,
      matchId: null,
      matchState: "lobby",
      scheduledStartServerMs: null,
      players: new Map()
    };

    this.addPlayerToRoom(room, hostId, hostName, 1);
    this.rooms.set(room.roomId, room);
    this.roomByCode.set(room.roomCode, room.roomId);
    return room;
  }

  private addPlayerToRoom(
    room: RoomRuntimeState,
    playerId: string,
    playerName: string,
    slot: 1 | 2
  ): void {
    room.players.set(playerId, {
      playerId,
      playerName,
      slot,
      connected: true,
      ready: false,
      hp: PVP_COMBAT_CONFIG.initialHp,
      maxHp: PVP_COMBAT_CONFIG.maxHp,
      score: 0,
      combo: 0,
      maxCombo: 0,
      accuracy: 100,
      judgedNotes: 0,
      counts: { ...INITIAL_SCORE_STATE.counts },
      lastSpecialAtMs: 0,
      judgedNoteIndices: new Set(),
      songEnded: false
    });
  }

  private getRoomForPlayer(playerId: string): RoomRuntimeState | undefined {
    const client = this.clients.get(playerId);
    if (!client?.roomId) {
      return undefined;
    }
    return this.rooms.get(client.roomId);
  }

  private getOpponent(room: RoomRuntimeState, playerId: string): PlayerRuntimeState | undefined {
    for (const player of room.players.values()) {
      if (player.playerId !== playerId) {
        return player;
      }
    }
    return undefined;
  }

  private removeFromQueue(playerId: string): void {
    const idx = this.quickQueue.indexOf(playerId);
    if (idx >= 0) {
      this.quickQueue.splice(idx, 1);
    }
  }

  private toPlayerSnapshots(room: RoomRuntimeState): PvpPlayerSnapshot[] {
    return Array.from(room.players.values())
      .sort((a, b) => a.slot - b.slot)
      .map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        slot: p.slot,
        connected: p.connected,
        ready: p.ready,
        hp: p.hp,
        maxHp: p.maxHp,
        score: p.score,
        combo: p.combo,
        maxCombo: p.maxCombo,
        accuracy: p.accuracy,
        judgedNotes: p.judgedNotes,
        counts: { ...p.counts },
        lastSpecialAtMs: p.lastSpecialAtMs
      }));
  }

  private toRoomSnapshot(room: RoomRuntimeState): PvpRoomSnapshot {
    return {
      roomId: room.roomId,
      roomCode: room.roomCode,
      mode: room.mode,
      hostId: room.hostId,
      chartId: room.chart.id,
      chartVersion: "1.0",
      matchId: room.matchId,
      matchState: room.matchState,
      scheduledStartServerMs: room.scheduledStartServerMs,
      players: this.toPlayerSnapshots(room)
    };
  }

  private broadcastRoomState(room: RoomRuntimeState): void {
    this.broadcastToRoom(room, {
      type: "room_state",
      room: this.toRoomSnapshot(room)
    });
  }

  private broadcastToRoom(room: RoomRuntimeState, message: PvpServerMessage): void {
    for (const player of room.players.values()) {
      this.clients.get(player.playerId)?.send(message);
    }
  }

  private sendError(playerId: string, code: string, message: string): void {
    this.clients.get(playerId)?.send({
      type: "error",
      code,
      message
    });
  }
}
