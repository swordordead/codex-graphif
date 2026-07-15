# Graphif Live Control Design

Date: 2026-07-15

## Summary

Add live Graphif canvas control to `codex-graphif` by pairing the existing MCP server with a Graphif extension. The MCP server remains Codex's entrypoint. The Graphif extension runs inside Graphif and applies commands to the currently open canvas through Graphif's extension API.

The current file-based `.prg` tools stay intact. Live control is an additive second mode.

## Problem

The existing MCP server can inspect, create, and modify `.prg` files. That is useful, but it is not real-time control of the open Graphif canvas. MCP cannot directly reach into a running Graphif window. Graphif must run an extension that can access its own `stageManager`, `nodeAdder`, and `nodeConnector` APIs.

## Goals

- Let Codex query whether Graphif is currently connected.
- Let Codex read nodes and edges from the active Graphif canvas.
- Let Codex add text nodes to the active canvas.
- Let Codex move and rename existing text nodes.
- Let Codex create line edges between existing text nodes.
- Let Codex generate a Beidou constellation graph directly in the active Graphif canvas.
- Keep the existing `.prg` file tools working unchanged.

## Non-Goals

- No operating-system window automation.
- No simulated mouse dragging.
- No direct dependency on Graphif's AI configuration UI.
- No full Graphif editor clone inside Codex.
- No destructive canvas-wide deletion in v1 unless a later explicit tool adds a confirmation flow.

## Feasibility Notes

Graphif's generated extension types expose canvas-level services that are enough for v1:

- `stageManager.getTextNodes()`
- `stageManager.getLineEdges()`
- `stageManager.getTextNodeByUUID(uuid)`
- `stageManager.getConnectableEntityByUUID(uuid)`
- `nodeAdder.addTextNodeByClick(...)`
- `nodeConnector.connectConnectableEntity(...)`
- `TextNode.rename(text)`
- `TextNode.moveTo(location)`
- `stageManager.delete(stageObject)`

This confirms that live control should be implemented through a Graphif extension, not by expanding MCP alone.

## Architecture

Components:

- `graphif-mcp`: Existing MCP server. It will gain live tools and a local bridge server.
- `graphif-live-plugin`: New Graphif extension package built with `extprg`.
- `liveBridge`: Local WebSocket bridge used by MCP and the Graphif extension.

Runtime flow:

1. User opens Graphif and installs/enables the live plugin.
2. User starts the MCP server.
3. The MCP server starts a local WebSocket server on `127.0.0.1:17321`.
4. The Graphif plugin connects to that WebSocket server.
5. Codex calls a live MCP tool.
6. MCP sends a JSON command over WebSocket.
7. The Graphif plugin applies the command to the active canvas.
8. The plugin sends a JSON response back to MCP.
9. MCP returns the response to Codex.

## Communication Protocol

Transport: WebSocket on `127.0.0.1:17321`.

Request:

```json
{
  "id": "request-id",
  "type": "command",
  "command": "add_text_node",
  "payload": {}
}
```

Response:

```json
{
  "id": "request-id",
  "ok": true,
  "result": {}
}
```

Error:

```json
{
  "id": "request-id",
  "ok": false,
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "Text node not found"
  }
}
```

Only one active Graphif plugin connection is supported in v1. If multiple Graphif windows connect, the newest connection replaces the previous one and the MCP status response reports that replacement.

## Live MCP Tools

### `live_status`

Returns whether the Graphif plugin is connected, bridge port, and last connection time.

### `live_list_nodes`

Returns text nodes from the active canvas:

- `uuid`
- `text`
- `x`
- `y`
- `width`
- `height`

### `live_list_edges`

Returns line edges from the active canvas:

- `uuid`
- `text`
- `sourceUuid`
- `targetUuid`

### `live_add_text_node`

Input:

- `text`
- `x`
- `y`
- optional `select`

Behavior:

- Calls `nodeAdder.addTextNodeByClick(...)`.
- Finds the created node by returned UUID.
- Renames it to the requested text if Graphif auto-generated a different label.

### `live_move_node`

Input:

- `nodeId`
- `x`
- `y`

Behavior:

- Resolves `nodeId` by UUID first, then by exact text.
- Calls `TextNode.moveTo(...)`.

### `live_rename_node`

Input:

- `nodeId`
- `text`

Behavior:

- Resolves `nodeId` by UUID first, then by exact text.
- Calls `TextNode.rename(text)`.

### `live_add_edge`

Input:

- `sourceId`
- `targetId`
- optional `text`

Behavior:

- Resolves both endpoints by UUID first, then exact text.
- Calls `nodeConnector.connectConnectableEntity(...)`.

### `live_create_beidou`

Input:

- optional `originX`
- optional `originY`
- optional `scale`

Behavior:

- Adds seven text nodes: `天枢`, `天璇`, `天玑`, `天权`, `玉衡`, `开阳`, `摇光`.
- Places them in an approximate Beidou constellation shape.
- Connects them in order:
  - `天枢 -> 天璇`
  - `天璇 -> 天玑`
  - `天玑 -> 天权`
  - `天权 -> 玉衡`
  - `玉衡 -> 开阳`
  - `开阳 -> 摇光`

## Graphif Plugin Commands

The plugin implements these bridge commands:

- `ping`
- `list_nodes`
- `list_edges`
- `add_text_node`
- `move_node`
- `rename_node`
- `add_edge`
- `create_beidou`

Each command returns a compact JSON result. The plugin should show a Graphif toast on connect and on unrecoverable bridge errors.

## Safety

- The bridge binds only to `127.0.0.1`.
- v1 does not expose a delete-all command.
- Commands require explicit node IDs or exact node text where applicable.
- If node text matches multiple nodes, the plugin returns `AMBIGUOUS_NODE`.
- MCP live tools return `GRAPHIF_NOT_CONNECTED` when the plugin is not connected.
- File-based `.prg` tools do not require the live plugin.

## Testing

Automated tests:

- Bridge server accepts one plugin connection.
- MCP live tools return `GRAPHIF_NOT_CONNECTED` when no plugin is connected.
- Request/response matching works with concurrent command IDs.
- Beidou command creates seven node commands and six edge commands in the expected order.
- Node resolution returns `NODE_NOT_FOUND` and `AMBIGUOUS_NODE` correctly in pure helper tests.

Manual verification:

- Build and install the Graphif extension.
- Open Graphif and confirm the plugin connects to the MCP bridge.
- Call `live_status` from MCP and see `connected: true`.
- Call `live_create_beidou` and confirm the active Graphif canvas shows the Beidou graph.
- Move and rename one node from Codex and confirm it updates live in Graphif.

## Documentation Updates

Update the root README with:

- Live mode architecture.
- How to build and install the Graphif plugin.
- How to start MCP and connect Graphif.
- Live tool reference.
- Troubleshooting for port conflicts and disconnected plugin state.

## Open Risks

- The Graphif extension template is minimal, so actual install/build behavior must be verified against Graphif locally.
- Graphif extension sandbox support for WebSocket must be verified. If direct WebSocket is blocked, fallback to polling `fetch` against a local HTTP server.
- Graphif's `addTextNodeByClick` may create an auto-named node before rename. v1 handles this by resolving the returned UUID and calling `rename`.
- Some changes may require Graphif history/update calls after mutation. If live visual refresh is inconsistent, implementation must call the relevant Graphif update or history APIs after each command.

