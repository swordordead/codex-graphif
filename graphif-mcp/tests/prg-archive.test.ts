import { describe, expect, it } from "vitest";
import { readPrgArchive } from "../src/prg/archive";

describe("prg archive", () => {
  it("reads the sample archive entries", async () => {
    const archive = await readPrgArchive("C:/Users/Administrator/Desktop/123.prg");
    expect(archive.entries).toContain("stage.msgpack");
    expect(archive.entries).toContain("metadata.msgpack");
  });
});
