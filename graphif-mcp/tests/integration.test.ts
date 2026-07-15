import { copyFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { addLineEdge, addTextNode, createPrg, inspectPrg, updateTextNode } from "../src/index";

const samplePath = "C:/Users/Administrator/Desktop/123.prg";

describe("integration", () => {
  it("creates and inspects a graph with Chinese text", async () => {
    const dir = await mkdtemp(join(tmpdir(), "graphif-mcp-"));
    const path = join(dir, "created.prg");

    await createPrg(
      path,
      [
        { id: "start", text: "开始", x: 0, y: 0 },
        { id: "middle", text: "处理", x: 180, y: 0 },
        { id: "end", text: "结束", x: 360, y: 0 },
      ],
      [
        { sourceId: "start", targetId: "middle" },
        { sourceId: "middle", targetId: "end" },
      ],
    );

    const graph = await inspectPrg(path);
    expect(graph.nodeCount).toBe(3);
    expect(graph.edgeCount).toBe(2);
    expect(graph.textNodes.map((node) => node.text)).toEqual(["开始", "处理", "结束"]);
  });

  it("updates a copied sample without overwriting the source file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "graphif-mcp-"));
    const path = join(dir, "sample.prg");
    await copyFile(samplePath, path);

    const before = await readFile(path);
    const result = await updateTextNode(path, "1", "updated");
    const after = await readFile(path);

    expect(Buffer.compare(before, after)).toBe(0);
    expect(result.outputPath).toMatch(/sample\.generated\.prg$/);

    const generated = await inspectPrg(result.outputPath);
    expect(generated.textNodes[0]?.text).toBe("updated");
  });

  it("adds a node and then adds a line edge to it", async () => {
    const dir = await mkdtemp(join(tmpdir(), "graphif-mcp-"));
    const path = join(dir, "base.prg");
    await createPrg(
      path,
      [
        { id: "one", text: "1", x: 0, y: 0 },
        { id: "two", text: "2", x: 180, y: 0 },
      ],
      [{ sourceId: "one", targetId: "two" }],
    );

    const withNode = await addTextNode(path, { id: "extra", text: "新增", x: 360, y: 0 });
    expect(withNode.nodeCount).toBe(3);

    const withEdge = await addLineEdge(withNode.outputPath, { sourceId: "2", targetId: "新增" });
    expect(withEdge.edgeCount).toBe(2);
  });
});
