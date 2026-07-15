import { describe, expect, it } from "vitest";
import { toolNames } from "../src/index";

describe("live tools", () => {
  it("registers live Graphif tools", () => {
    expect(toolNames).toContain("live_status");
    expect(toolNames).toContain("live_list_nodes");
    expect(toolNames).toContain("live_list_edges");
    expect(toolNames).toContain("live_add_text_node");
    expect(toolNames).toContain("live_move_node");
    expect(toolNames).toContain("live_rename_node");
    expect(toolNames).toContain("live_add_edge");
    expect(toolNames).toContain("live_create_beidou");
  });
});
