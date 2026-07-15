# Codex Graphif

Codex Graphif lets Codex work with Graphif in two ways:

1. File mode: inspect, create, and modify Graphif `.prg` files.
2. Live mode: control the currently open Graphif canvas through a Graphif extension and a localhost bridge.

Live mode is the realtime path. MCP alone cannot control an open Graphif canvas; the `graphif-live-plugin` extension must be installed inside Graphif so it can call Graphif's canvas APIs.

## Tech Stack

- Node.js 24+
- TypeScript
- npm workspaces
- MCP SDK
- Graphif `extprg`
- Graphif `extprg-types`
- `@zip.js/zip.js`
- `@msgpack/msgpack`
- `ws`
- Vitest

## Setup

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build all packages:

```bash
npm run build
```

Start the MCP server and live bridge:

```bash
npm start
```

Windows can also run:

```text
start.bat
```

The MCP server uses stdio for Codex and opens a localhost WebSocket bridge at `127.0.0.1:17321` for the Graphif plugin.

## MCP Configuration

After building, the MCP server entrypoint is:

```text
graphif-mcp/dist/server.js
```

Example client config:

```json
{
  "mcpServers": {
    "graphif": {
      "command": "node",
      "args": [
        "C:/Users/Administrator/Documents/Codex/2026-07-15/woy/graphif-mcp/dist/server.js"
      ]
    }
  }
}
```

## Install the Graphif Live Plugin

Build the plugin:

```bash
npm run build --workspace graphif-live-plugin
```

Install it into Graphif:

```bash
npm run install:ext --workspace graphif-live-plugin
```

Then start the MCP server and open Graphif. The plugin connects to `ws://127.0.0.1:17321` and shows a toast when connected.

## File Tools

- `inspect_prg`: read `.prg` nodes, edges, and version metadata
- `export_json`: export a JSON-safe graph representation
- `create_prg`: create a `.prg` from nodes and edges
- `update_text_node`: update a text node and write `.generated.prg` by default
- `add_text_node`: add a text node to a `.prg`
- `add_line_edge`: add a line edge to a `.prg`

## Live Tools

- `live_status`: check whether Graphif is connected
- `live_list_nodes`: read text nodes from the active Graphif canvas
- `live_list_edges`: read line edges from the active Graphif canvas
- `live_add_text_node`: add a text node live
- `live_move_node`: move a text node live
- `live_rename_node`: rename a text node live
- `live_add_edge`: connect two text nodes live
- `live_create_beidou`: draw a Beidou constellation graph live

## Directory Structure

```text
.
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── graphif-live-plugin/
│   ├── src/
│   ├── icon.svg
│   └── package.json
├── graphif-mcp/
│   ├── src/
│   │   ├── aiAdapter/
│   │   ├── liveBridge/
│   │   ├── prg/
│   │   ├── tools/
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   └── server.ts
│   └── tests/
├── package.json
└── start.bat
```

## Deployment Notes

1. Run `npm install`.
2. Run `npm run build`.
3. Install the Graphif plugin with `npm run install:ext --workspace graphif-live-plugin`.
4. Configure Codex to run `node graphif-mcp/dist/server.js`.
5. Start Codex/MCP, open Graphif, then call `live_status`.

The Graphif AI configuration UI is not used. Live control is done through the Graphif extension APIs.
