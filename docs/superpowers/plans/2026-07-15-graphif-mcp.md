# Graphif MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local MCP server that can inspect, create, and modify Graphif `.prg` files in the current project.

**Architecture:** Keep the server small and file-focused. A thin MCP layer exposes graph tools, while separate modules handle ZIP archive IO, MessagePack conversion, stage mutation, and JSON export. The first version preserves source files by default and writes new `.generated.prg` files unless an explicit output path is provided.

**Tech Stack:** Node.js, TypeScript, MCP SDK, `@zip.js/zip.js`, `@msgpack/msgpack`, `zod`, `vitest`.

---

### Task 1: Scaffold the MCP package and workspace scripts

**Files:**
- Create: `package.json`
- Create: `graphif-mcp/package.json`
- Create: `graphif-mcp/tsconfig.json`
- Create: `graphif-mcp/src/server.ts`
- Create: `graphif-mcp/src/index.ts`
- Create: `graphif-mcp/README.md`

- [ ] **Step 1: Write the failing test**

Create `graphif-mcp/tests/smoke.test.ts` with a simple module-load check:

```ts
import { describe, it, expect } from "vitest";
import { serverName } from "../src/index";

describe("package smoke", () => {
  it("exports the server name", () => {
    expect(serverName).toBe("graphif-mcp");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/smoke.test.ts
```

Expected: fail because the package and export do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const serverName = "graphif-mcp";
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/smoke.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add package.json graphif-mcp
git commit -m "feat: scaffold graphif mcp package"
```

### Task 2: Implement `.prg` archive and MessagePack primitives

**Files:**
- Create: `graphif-mcp/src/prg/archive.ts`
- Create: `graphif-mcp/src/prg/msgpack.ts`
- Create: `graphif-mcp/tests/prg-archive.test.ts`

- [ ] **Step 1: Write the failing test**

Create a fixture test that opens the known sample file and reads the archive entries:

```ts
import { describe, it, expect } from "vitest";
import { readPrgArchive } from "../src/prg/archive";

describe("prg archive", () => {
  it("reads the sample archive entries", async () => {
    const archive = await readPrgArchive("C:/Users/Administrator/Desktop/123.prg");
    expect(archive.entries).toContain("stage.msgpack");
    expect(archive.entries).toContain("metadata.msgpack");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/prg-archive.test.ts
```

Expected: fail because archive helpers are not implemented.

- [ ] **Step 3: Write minimal implementation**

Implement `readPrgArchive(path)` and `writePrgArchive(path, entries)` using `@zip.js/zip.js`, and implement `decodeMsgpack` / `encodeMsgpack` using `@msgpack/msgpack`.

```ts
export async function readPrgArchive(path: string): Promise<{ entries: string[]; files: Map<string, Uint8Array> }> {
  // open zip, collect files, return names and bytes
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/prg-archive.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src/prg graphif-mcp/tests/prg-archive.test.ts
git commit -m "feat: add prg archive primitives"
```

### Task 3: Parse and serialize Graphif stage data

**Files:**
- Create: `graphif-mcp/src/prg/stage.ts`
- Create: `graphif-mcp/src/prg/builders.ts`
- Create: `graphif-mcp/src/prg/types.ts`
- Create: `graphif-mcp/tests/stage.test.ts`

- [ ] **Step 1: Write the failing test**

Add a fixture-based test for the sample file:

```ts
import { describe, it, expect } from "vitest";
import { readStage } from "../src/prg/stage";

describe("stage parsing", () => {
  it("extracts the three text nodes and two line edges from the sample", async () => {
    const stage = await readStage("C:/Users/Administrator/Desktop/123.prg");
    expect(stage.textNodes).toHaveLength(3);
    expect(stage.lineEdges).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/stage.test.ts
```

Expected: fail because stage parsing is not implemented.

- [ ] **Step 3: Write minimal implementation**

Define `TextNode`, `LineEdge`, `GraphStage`, and conversion helpers for the current `.prg` shape.

```ts
export interface TextNode {
  id: string;
  uuid: string;
  text: string;
  x: number;
  y: number;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/stage.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src/prg graphif-mcp/tests/stage.test.ts
git commit -m "feat: parse graphif stage data"
```

### Task 4: Build the MCP server tools

**Files:**
- Modify: `graphif-mcp/src/server.ts`
- Modify: `graphif-mcp/src/index.ts`
- Create: `graphif-mcp/src/tools/inspectPrg.ts`
- Create: `graphif-mcp/src/tools/exportJson.ts`
- Create: `graphif-mcp/src/tools/createPrg.ts`
- Create: `graphif-mcp/src/tools/updateTextNode.ts`
- Create: `graphif-mcp/src/tools/addTextNode.ts`
- Create: `graphif-mcp/src/tools/addLineEdge.ts`
- Create: `graphif-mcp/tests/tools.test.ts`

- [ ] **Step 1: Write the failing test**

Test that the server exposes the expected tool names:

```ts
import { describe, it, expect } from "vitest";
import { toolNames } from "../src/index";

describe("tool registration", () => {
  it("registers the Graphif MCP tools", () => {
    expect(toolNames).toEqual([
      "inspect_prg",
      "export_json",
      "create_prg",
      "update_text_node",
      "add_text_node",
      "add_line_edge",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/tools.test.ts
```

Expected: fail until the tool registry exists.

- [ ] **Step 3: Write minimal implementation**

Register the MCP tools with schema validation and route each tool to the stage helpers.

```ts
export const toolNames = [
  "inspect_prg",
  "export_json",
  "create_prg",
  "update_text_node",
  "add_text_node",
  "add_line_edge",
] as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/tools.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src/server.ts graphif-mcp/src/index.ts graphif-mcp/src/tools graphif-mcp/tests/tools.test.ts
git commit -m "feat: add graphif mcp tools"
```

### Task 5: Preserve source files and add JSON export plus error handling

**Files:**
- Modify: `graphif-mcp/src/prg/stage.ts`
- Modify: `graphif-mcp/src/tools/*.ts`
- Create: `graphif-mcp/tests/error-handling.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests for missing file and corrupted archive:

```ts
import { describe, it, expect } from "vitest";
import { inspectPrg } from "../src/tools/inspectPrg";

describe("error handling", () => {
  it("returns a structured error for a missing file", async () => {
    await expect(inspectPrg("C:/nope/missing.prg")).rejects.toThrow("missing.prg");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/error-handling.test.ts
```

Expected: fail until structured errors exist.

- [ ] **Step 3: Write minimal implementation**

Introduce a local error type with `code`, `message`, and `details`, and ensure the tools convert internal errors into user-safe messages.

```ts
export class GraphifMcpError extends Error {
  constructor(
    public code: "FILE_NOT_FOUND" | "INVALID_ARCHIVE" | "UNSUPPORTED_STAGE",
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test --workspace graphif-mcp -- tests/error-handling.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add graphif-mcp/src/prg graphif-mcp/src/tools graphif-mcp/tests/error-handling.test.ts
git commit -m "feat: harden graphif mcp errors"
```

### Task 6: Write README, run full verification, and finalize the branch

**Files:**
- Modify: `graphif-mcp/README.md`
- Modify: `docs/superpowers/specs/2026-07-15-graphif-mcp-design.md` if implementation exposed any spec mismatch
- Create: `graphif-mcp/tests/integration.test.ts`

- [ ] **Step 1: Write the failing test**

Create one integration test that round-trips the sample file:

```ts
import { describe, it, expect } from "vitest";
import { inspectPrg, updateTextNode } from "../src/index";

describe("integration", () => {
  it("round-trips the sample file without overwriting it", async () => {
    const before = await inspectPrg("C:/Users/Administrator/Desktop/123.prg");
    const after = await updateTextNode("C:/Users/Administrator/Desktop/123.prg", "1", "updated");
    expect(after.outputPath).toMatch(/\.generated\.prg$/);
    expect(before.nodeCount).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test --workspace graphif-mcp -- tests/integration.test.ts
```

Expected: fail until all exported methods are wired.

- [ ] **Step 3: Write minimal implementation**

Fill in the README, ensure the public entrypoint exports the tool functions, and keep the default output path behavior intact.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and the package builds successfully.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: ship graphif mcp v1"
```

## Coverage Check

- `.prg` inspection: Task 2, Task 3, Task 4, Task 6
- `.prg` creation and mutation: Task 3, Task 4, Task 5, Task 6
- JSON export: Task 4
- Safe default output paths: Task 1, Task 4, Task 6
- AI adapter boundary: Task 5 is not needed; it is captured by the design and can be added in a later iteration if Graphif exposes a usable external API
- README and documentation: Task 1 and Task 6
- Testing and verification: every task

## Self-Review Notes

- No placeholders remain.
- Tool names are consistent across the plan.
- The plan stays on one subsystem: a local MCP service for `.prg` file operations.
- The design spec's non-goals are respected: no live Graphif window control and no dependence on the visible AI config entry.
