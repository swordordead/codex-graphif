# Codex Graphif Live

Graphif extension for live Codex control of the active canvas.

Build:

```bash
npm run build --workspace graphif-live-plugin
```

Install into Graphif:

```bash
npm run install:ext --workspace graphif-live-plugin
```

Start the MCP server before opening or enabling this extension so it can connect to `ws://127.0.0.1:17321`.

The install script copies `dist/` to the Graphif extension data directory for app id `liren.project-graph`.
It also rewrites the installed `.mcp.json` to point at the local workspace's built MCP server, so reinstall after moving the repo.

Live commands resolve nodes by UUID only. If you need text-based lookup, add a dedicated search step instead of reusing the live mutation commands.
