import { handleCommand } from "./commands";
import type { LiveCommandRequest, LiveCommandResponse } from "./protocol";

const bridgeUrl = "ws://127.0.0.1:17321";
let reconnectTimer: number | undefined;

connect();

function connect() {
  const socket = new WebSocket(bridgeUrl);

  socket.addEventListener("open", () => {
    void prg.toast("Codex Graphif Live connected");
  });

  socket.addEventListener("message", (event) => {
    void handleMessage(socket, event.data);
  });

  socket.addEventListener("close", () => {
    scheduleReconnect();
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

async function handleMessage(socket: WebSocket, raw: unknown) {
  let request: LiveCommandRequest;
  try {
    request = JSON.parse(String(raw)) as LiveCommandRequest;
  } catch {
    return;
  }

  try {
    const result = await handleCommand(request.command, request.payload);
    send(socket, {
      id: request.id,
      ok: true,
      result,
    });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "COMMAND_FAILED";
    send(socket, {
      id: request.id,
      ok: false,
      error: {
        code,
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

function send(socket: WebSocket, response: LiveCommandResponse) {
  socket.send(JSON.stringify(response));
}

function scheduleReconnect() {
  if (reconnectTimer !== undefined) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = undefined;
    connect();
  }, 1500);
}

export {};
