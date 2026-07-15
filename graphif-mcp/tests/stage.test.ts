import { describe, expect, it } from "vitest";
import { readStage } from "../src/prg/stage";

describe("stage parsing", () => {
  it("extracts the three text nodes and two line edges from the sample", async () => {
    const stage = await readStage("C:/Users/Administrator/Desktop/123.prg");
    expect(stage.textNodes).toHaveLength(3);
    expect(stage.lineEdges).toHaveLength(2);
  });
});
