import WebSocket from "ws";
import { afterEach, describe, expect, it } from "vitest";
import { LiveBridge } from "../src/liveBridge/bridge";

const bridges: LiveBridge[] = [];

afterEach(async () => {
  await Promise.all(bridges.splice(0).map((bridge) => bridge.stop()));
});

describe("live bridge", () => {
  it("reports disconnected before a plugin connects", () => {
    const bridge = new LiveBridge({ port: 0 });
    bridges.push(bridge);

    expect(bridge.status().connected).toBe(false);
  });

  it("forwards a command to the connected plugin", async () => {
    const bridge = new LiveBridge({ port: 0 });
    bridges.push(bridge);
    await bridge.start();

    const socket = new WebSocket(`ws://127.0.0.1:${bridge.status().port}`);
    socket.on("message", (data) => {
      const request = JSON.parse(data.toString());
      socket.send(
        JSON.stringify({
          id: request.id,
          ok: true,
          result: { pong: true },
        }),
      );
    });

    await onceOpen(socket);
    const result = await bridge.sendCommand("ping", {});

    expect(result).toEqual({ pong: true });
  });

  it("rejects pending commands immediately when the plugin reconnects", async () => {
    const bridge = new LiveBridge({ port: 0, commandTimeoutMs: 2000 });
    bridges.push(bridge);
    await bridge.start();

    const firstSocket = new WebSocket(`ws://127.0.0.1:${bridge.status().port}`);
    await onceOpen(firstSocket);

    const pending = bridge.sendCommand("ping", {});
    const rejection = pending.then(
      () => {
        throw new Error("Expected Graphif reconnection to reject pending command");
      },
      (error) => error,
    );

    const secondSocket = new WebSocket(`ws://127.0.0.1:${bridge.status().port}`);
    await onceOpen(secondSocket);

    await expect(rejection).resolves.toMatchObject({
      code: "GRAPHIF_RECONNECTED",
    });
  });
});

function onceOpen(socket: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
}
