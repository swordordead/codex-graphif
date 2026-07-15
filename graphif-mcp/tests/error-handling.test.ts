import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { GraphifMcpError } from "../src/errors";
import { exportJson } from "../src/tools/exportJson";
import { inspectPrg } from "../src/tools/inspectPrg";

describe("error handling", () => {
  it("returns a structured error for a missing file", async () => {
    await expect(inspectPrg("C:/nope/missing.prg")).rejects.toMatchObject({
      code: "FILE_NOT_FOUND",
    });
  });

  it("returns a structured error for a corrupted prg archive", async () => {
    const dir = await mkdtemp(join(tmpdir(), "graphif-mcp-"));
    const path = join(dir, "broken.prg");
    await writeFile(path, "not a zip archive");

    await expect(inspectPrg(path)).rejects.toBeInstanceOf(GraphifMcpError);
    await expect(inspectPrg(path)).rejects.toMatchObject({
      code: "INVALID_ARCHIVE",
    });
  });

  it("exports the sample as JSON-safe graph data", async () => {
    const graph = await exportJson("C:/Users/Administrator/Desktop/123.prg");
    expect(graph.nodeCount).toBe(3);
    expect(graph.edgeCount).toBe(2);
    expect(graph.textNodes[0]?.text).toBe("1");
  });
});
