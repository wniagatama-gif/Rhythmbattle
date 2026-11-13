import { describe, expect, test } from "bun:test";
import type { PvpServerMessage } from "../packages/shared/src/index";
import { PVP_COMBAT_CONFIG } from "../packages/shared/src/index";
import { PvpRoomManager } from "../apps/server/src/modules/pvp/PvpRoomManager";

function createTestClient(manager: PvpRoomManager, connectionId: string) {
  const messages: PvpServerMessage[] = [];
  manager.registerConnection(connectionId, (msg) => {
    messages.push(msg);
  });

  return {
    messages,
    send(payload: Record<string, unknown>) {
      manager.handleRawMessage(connectionId, JSON.stringify(payload));
    },
    disconnect() {
      manager.handleDisconnect(connectionId);
    },
    lastOfType<T extends PvpServerMessage["type"]>(
      type: T,
    ): Extract<PvpServerMessage, { type: T }> | undefined {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg && msg.type === type) {
          return msg as Extract<PvpServerMessage, { type: T }>;
        }
      }
      return undefined;
    },
  };
}

describe("PvpRoomManager", () => {
  test("pairs two players via Quick Match and schedules synchronized start when ready", () => {
    const manager = new PvpRoomManager({ countdownMs: 500 });
    const p1 = createTestClient(manager, "conn-1");
    const p2 = createTestClient(manager, "conn-2");

    p1.send({ type: "hello", playerName: "Alpha" });
    p2.send({ type: "hello", playerName: "Bravo" });

    p1.send({ type: "quick_match" });
    p2.send({ type: "quick_match" });

    const p1Room = p1.lastOfType("room_state")?.room;
    const p2Room = p2.lastOfType("room_state")?.room;

    expect(p1Room).toBeDefined();
    expect(p2Room).toBeDefined();
    expect(p1Room?.roomCode).toBe(p2Room?.roomCode ?? "");
    expect(p1Room?.players.length).toBe(2);
    expect(p1Room?.matchState).toBe("lobby");

    p1.send({ type: "set_ready", ready: true });
    p2.send({ type: "set_ready", ready: true });

    const scheduled1 = p1.lastOfType("match_scheduled");
    const scheduled2 = p2.lastOfType("match_scheduled");
    expect(scheduled1).toBeDefined();
    expect(scheduled2).toBeDefined();
    expect(scheduled1?.scheduledStartServerMs).toBe(
      scheduled2?.scheduledStartServerMs ?? 0,
    );
    expect(scheduled1?.chartId).toBe("demo-song-001-easy");
  });

  test("supports private room, ping/pong clock sync, and reconnect by playerId", () => {
    const manager = new PvpRoomManager({ countdownMs: 500 });
    const p1 = createTestClient(manager, "conn-a");
    const p2 = createTestClient(manager, "conn-b");

    p1.send({ type: "hello", playerName: "Host" });
    const welcome1 = p1.lastOfType("welcome");
    expect(welcome1?.playerId).toBeTruthy();

    p1.send({ type: "ping", clientTimeMs: 12345 });
    const pong = p1.lastOfType("pong");
    expect(pong?.clientTimeMs).toBe(12345);
    expect(typeof pong?.serverTimeMs).toBe("number");

    p1.send({ type: "create_room", chartId: "demo-song-001-easy" });
    const createdRoom = p1.lastOfType("room_state")?.room;
    expect(createdRoom?.mode).toBe("private");
    expect(createdRoom?.roomCode.length).toBeGreaterThanOrEqual(4);

    p2.send({ type: "hello", playerName: "Guest" });
    p2.send({ type: "join_room", roomCode: createdRoom!.roomCode });

    const guestRoom = p2.lastOfType("room_state")?.room;
    expect(guestRoom?.players.length).toBe(2);

    // Disconnect host and reconnect on a new connectionId with the original playerId
    p1.disconnect();
    const p1Reconnected = createTestClient(manager, "conn-a-2");
    p1Reconnected.send({
      type: "hello",
      playerId: welcome1!.playerId,
      playerName: "Host",
    });

    const reconnectedRoom = p1Reconnected.lastOfType("room_state")?.room;
    expect(reconnectedRoom?.roomCode).toBe(createdRoom?.roomCode);
    const reconnectedHost = reconnectedRoom?.players.find(
      (p) => p.playerId === welcome1!.playerId,
    );
    expect(reconnectedHost?.connected).toBe(true);
  });

  test("validates server-authoritative judgments, anti-double-hit, special attack, and match completion", () => {
    const manager = new PvpRoomManager({ countdownMs: 200 });
    const p1 = createTestClient(manager, "conn-p1");
    const p2 = createTestClient(manager, "conn-p2");

    p1.send({ type: "hello", playerName: "Striker" });
    p2.send({ type: "hello", playerName: "Defender" });

    const p1Id = p1.lastOfType("welcome")!.playerId;
    const p2Id = p2.lastOfType("welcome")!.playerId;

    p1.send({ type: "quick_match" });
    p2.send({ type: "quick_match" });
    p1.send({ type: "set_ready", ready: true });
    p2.send({ type: "set_ready", ready: true });

    // First 10 notes of demo-song-001-easy
    const firstTenNotes = [
      { index: 0, lane: 0, time: 2.0 },
      { index: 1, lane: 1, time: 2.5 },
      { index: 2, lane: 2, time: 3.0 },
      { index: 3, lane: 3, time: 3.5 },
      { index: 4, lane: 2, time: 4.5 },
      { index: 5, lane: 1, time: 5.0 },
      { index: 6, lane: 0, time: 5.5 },
      { index: 7, lane: 1, time: 7.0 },
      { index: 8, lane: 2, time: 7.5 },
      { index: 9, lane: 3, time: 8.0 },
    ];

    // Hit note 0 accurately with Striker
    p1.send({
      type: "note_input",
      lane: 0,
      songTimeSec: 2.005,
    });
    const firstJudged = p1.lastOfType("note_judged");
    expect(firstJudged?.judgement).toBe("PERFECT");
    expect(firstJudged?.playerId).toBe(p1Id);

    const hpAfterHit = firstJudged?.players.find(
      (p) => p.playerId === p2Id,
    )?.hp;
    expect(hpAfterHit).toBe(
      PVP_COMBAT_CONFIG.initialHp - PVP_COMBAT_CONFIG.damageDealt.PERFECT,
    );

    // Anti-double-hit: replaying note 0 at same timestamp should NOT emit another note_judged
    const countBeforeDuplicate = p1.messages.filter(
      (m) => m.type === "note_judged",
    ).length;
    p1.send({
      type: "note_input",
      lane: 0,
      songTimeSec: 2.01,
    });
    const countAfterDuplicate = p1.messages.filter(
      (m) => m.type === "note_judged",
    ).length;
    expect(countAfterDuplicate).toBe(countBeforeDuplicate);

    // Defender misses note 0 -> takes selfDamage
    p2.send({
      type: "note_miss_timeout",
      noteIndex: 0,
    });
    const missResult = p2.lastOfType("note_judged");
    expect(missResult?.judgement).toBe("MISS");
    const defenderAfterMiss = missResult?.players.find(
      (p) => p.playerId === p2Id,
    );
    expect(defenderAfterMiss?.hp).toBe(
      PVP_COMBAT_CONFIG.initialHp -
        PVP_COMBAT_CONFIG.damageDealt.PERFECT -
        PVP_COMBAT_CONFIG.selfDamage.MISS,
    );

    // Striker attempts special attack before reaching combo 10 -> rejected (no special_triggered)
    p1.send({ type: "special_attack" });
    expect(p1.lastOfType("special_triggered")).toBeUndefined();

    // Striker hits notes 1..9 to reach combo 10
    for (const note of firstTenNotes.slice(1)) {
      p1.send({
        type: "note_input",
        lane: note.lane,
        songTimeSec: note.time,
      });
    }

    const strikerState = p1.lastOfType("note_judged")?.players.find(
      (p) => p.playerId === p1Id,
    );
    expect(strikerState?.combo).toBe(10);

    // Now special attack succeeds
    p1.send({ type: "special_attack" });
    const specialEvent = p1.lastOfType("special_triggered");
    expect(specialEvent).toBeDefined();
    expect(specialEvent?.attackerId).toBe(p1Id);
    expect(specialEvent?.defenderId).toBe(p2Id);
    expect(specialEvent?.damage).toBe(PVP_COMBAT_CONFIG.specialAttack.damage);

    // Finish song on both sides -> match_finished
    p1.send({ type: "match_song_ended" });
    p2.send({ type: "match_song_ended" });
    const finished = p1.lastOfType("match_finished");
    expect(finished).toBeDefined();
    expect(finished?.winnerId).toBe(p1Id);
    expect(finished?.reason).toBe("song_complete");
  });
});
