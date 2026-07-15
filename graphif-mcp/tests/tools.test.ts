import { describe, expect, it } from "vitest";
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
