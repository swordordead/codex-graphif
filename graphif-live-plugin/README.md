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
