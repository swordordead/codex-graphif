# Graphif Live Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live Graphif canvas control through a Graphif extension connected to the existing MCP server over a localhost bridge.

**Architecture:** Keep the existing `.prg` file tools unchanged. Add a WebSocket bridge inside `graphif-mcp`, live MCP tools that forward commands to the bridge, and a `graphif-live-plugin` extension that runs inside Graphif and applies commands to the active canvas.

**Tech Stack:** Node.js, TypeScript, MCP SDK, `ws`, Vitest, Graphif `extprg`, Graphif `extprg-types`.

---

### Task 1: Add Live Bridge Core

**Files:**
- Create: `graphif-mcp/src/liveBridge/protocol.ts`
- Create: `graphif-mcp/src/liveBridge/bridge.ts`
- Create: `graphif-mcp/tests/live-bridge.test.ts`
- Modify: `graphif-mcp/package.json`

- [ ] **Step 1: Write the failing test**

Create `graphif-mcp/tests/live-bridge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LiveBridge } from "../src/liveBridge/bridge";

describe("live bridge", () => {
  it("reports disconnected before a plugin connects", () => {
    const bridge = new LiveBridge({ port: 0 });
    expect(bridge.status().connected).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/live-bridge.test.ts
```

Expected: fail because `LiveBridge` does not exist.

- [ ] **Step 3: Implement bridge status and protocol types**

Implement `LiveBridge` with `status()`, `start()`, `stop()`, and `sendCommand()`. Add protocol types for command request, success response, and error response.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/live-bridge.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/package.json graphif-mcp/src/liveBridge graphif-mcp/tests/live-bridge.test.ts package-lock.json
git commit -m "feat: add graphif live bridge core"
```

### Task 2: Add Live MCP Tools

**Files:**
- Create: `graphif-mcp/src/tools/liveStatus.ts`
- Create: `graphif-mcp/src/tools/liveCommands.ts`
- Modify: `graphif-mcp/src/index.ts`
- Modify: `graphif-mcp/src/server.ts`
- Create: `graphif-mcp/tests/live-tools.test.ts`

- [ ] **Step 1: Write the failing test**

Create `graphif-mcp/tests/live-tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toolNames } from "../src/index";

describe("live tools", () => {
  it("registers live Graphif tools", () => {
    expect(toolNames).toContain("live_status");
    expect(toolNames).toContain("live_create_beidou");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/live-tools.test.ts
```

Expected: fail until live tools are registered.

- [ ] **Step 3: Implement live tool functions and MCP registration**

Add these tools:

- `live_status`
- `live_list_nodes`
- `live_list_edges`
- `live_add_text_node`
- `live_move_node`
- `live_rename_node`
- `live_add_edge`
- `live_create_beidou`

Each command forwards through `LiveBridge.sendCommand()`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/live-tools.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src graphif-mcp/tests/live-tools.test.ts
git commit -m "feat: add graphif live mcp tools"
```

### Task 3: Add Beidou Command Builder

**Files:**
- Create: `graphif-mcp/src/liveBridge/beidou.ts`
- Create: `graphif-mcp/tests/beidou.test.ts`

- [ ] **Step 1: Write the failing test**

Create `graphif-mcp/tests/beidou.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildBeidouOperations } from "../src/liveBridge/beidou";

describe("beidou builder", () => {
  it("creates seven node operations and six edge operations", () => {
    const operations = buildBeidouOperations({ originX: 0, originY: 0, scale: 1 });
    expect(operations.nodes).toHaveLength(7);
    expect(operations.edges).toHaveLength(6);
    expect(operations.nodes.map((node) => node.text)).toEqual(["天枢", "天璇", "天玑", "天权", "玉衡", "开阳", "摇光"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/beidou.test.ts
```

Expected: fail because the builder does not exist.

- [ ] **Step 3: Implement the Beidou shape builder**

Return deterministic node positions and edge order. Use coordinates that form a clear dipper shape at scale `1`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/beidou.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src/liveBridge/beidou.ts graphif-mcp/tests/beidou.test.ts
git commit -m "feat: add beidou live graph builder"
```

### Task 4: Scaffold Graphif Live Plugin

**Files:**
- Create: `graphif-live-plugin/package.json`
- Create: `graphif-live-plugin/tsconfig.json`
- Create: `graphif-live-plugin/tsdown.config.ts`
- Create: `graphif-live-plugin/src/extension.ts`
- Create: `graphif-live-plugin/src/protocol.ts`
- Create: `graphif-live-plugin/src/nodeResolver.ts`
- Create: `graphif-live-plugin/icon.svg`
- Create: `graphif-live-plugin/README.md`

- [ ] **Step 1: Write the failing test**

Create `graphif-live-plugin/src/nodeResolver.ts` with tests only if the plugin package test tooling is added. If no plugin test tooling is added, run TypeScript build as the verification target.

- [ ] **Step 2: Run build to verify it fails**

Run:

```bash
npm run build --workspace graphif-live-plugin
```

Expected: fail because the package does not exist.

- [ ] **Step 3: Implement plugin scaffold**

Create an `extprg` extension package that connects to `ws://127.0.0.1:17321`, registers command handlers, and shows a toast when connected.

- [ ] **Step 4: Run build to verify it passes**

Run:

```bash
npm run build --workspace graphif-live-plugin
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-live-plugin package.json package-lock.json
git commit -m "feat: scaffold graphif live plugin"
```

### Task 5: Implement Plugin Canvas Commands

**Files:**
- Modify: `graphif-live-plugin/src/extension.ts`
- Modify: `graphif-live-plugin/src/nodeResolver.ts`
- Create: `graphif-live-plugin/src/commands.ts`

- [ ] **Step 1: Build before implementation**

Run:

```bash
npm run build --workspace graphif-live-plugin
```

Expected: pass from Task 4.

- [ ] **Step 2: Implement command handlers**

Implement:

- `ping`
- `list_nodes`
- `list_edges`
- `add_text_node`
- `move_node`
- `rename_node`
- `add_edge`
- `create_beidou`

Use Graphif APIs:

- `prg.project.stageManager.getTextNodes()`
- `prg.project.stageManager.getLineEdges()`
- `prg.project.nodeAdder.addTextNodeByClick(...)`
- `prg.project.nodeConnector.connectConnectableEntity(...)`
- `TextNode.rename(...)`
- `TextNode.moveTo(...)`

- [ ] **Step 3: Run plugin build**

Run:

```bash
npm run build --workspace graphif-live-plugin
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add graphif-live-plugin/src
git commit -m "feat: implement graphif live plugin commands"
```

### Task 6: Verify, Document, and Push

**Files:**
- Modify: `README.md`
- Modify: `graphif-mcp/README.md`
- Modify: `start.bat`
- Create or modify: `graphif-live-plugin/README.md`

- [ ] **Step 1: Update documentation**

Document live mode setup:

- Build MCP.
- Build Graphif plugin.
- Install plugin with `npm run install:ext --workspace graphif-live-plugin`.
- Start MCP.
- Open Graphif and verify `live_status`.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and both packages build.

- [ ] **Step 3: Commit**

```bash
git add README.md graphif-mcp/README.md graphif-live-plugin/README.md start.bat package.json package-lock.json
git commit -m "docs: document graphif live control"
```

- [ ] **Step 4: Push**

Run:

```bash
git push
```

Expected: push to `origin/master` succeeds.

## Coverage Check

- Live architecture: Tasks 1, 2, 4, 5
- Beidou realtime graph: Task 3 and Task 5
- Graphif plugin: Task 4 and Task 5
- MCP live tools: Task 2
- Tests: Tasks 1, 2, 3, 6
- Documentation and push: Task 6

## Self-Review Notes

- The plan keeps the existing `.prg` tools intact.
- The plan does not rely on Graphif's AI configuration UI.
- The risky point is WebSocket availability inside the Graphif extension sandbox. If blocked during Task 4 or 5, switch the bridge to local HTTP polling and update the design document before continuing.

