import { describe, expect, it } from "vitest";
import { buildBeidouOperations } from "../src/liveBridge/beidou";

describe("beidou builder", () => {
  it("creates seven node operations and six edge operations", () => {
    const operations = buildBeidouOperations({ originX: 0, originY: 0, scale: 1 });
    expect(operations.nodes).toHaveLength(7);
    expect(operations.edges).toHaveLength(6);
    expect(operations.nodes.map((node) => node.text)).toEqual(["天枢", "天璇", "天玑", "天权", "玉衡", "开阳", "摇光"]);
    expect(operations.edges[0]).toEqual({ sourceId: "天枢", targetId: "天璇" });
    expect(operations.edges[5]).toEqual({ sourceId: "开阳", targetId: "摇光" });
  });
});
