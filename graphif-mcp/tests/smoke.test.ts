import { describe, expect, it } from "vitest";
import { serverName } from "../src/index";

describe("package smoke", () => {
  it("exports the server name", () => {
    expect(serverName).toBe("graphif-mcp");
  });
});
