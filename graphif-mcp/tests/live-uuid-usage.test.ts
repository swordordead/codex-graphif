import { describe, expect, it } from "vitest";
import { createGraphifMcpServer } from "../src/server";

describe("live UUID usage", () => {
  it("documents UUID-only live mutation inputs", () => {
    const server = createGraphifMcpServer() as unknown as {
      _registeredTools: Record<string, { inputSchema: { shape: Record<string, { description?: string }> } }>;
    };

    const moveNode = server._registeredTools.live_move_node;
    const renameNode = server._registeredTools.live_rename_node;
    const addEdge = server._registeredTools.live_add_edge;

    expect(moveNode?.inputSchema.shape.nodeId.description).toContain("UUID");
    expect(renameNode?.inputSchema.shape.nodeId.description).toContain("UUID");
    expect(addEdge?.inputSchema.shape.sourceId.description).toContain("UUID");
    expect(addEdge?.inputSchema.shape.targetId.description).toContain("UUID");
  });
});
