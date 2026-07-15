import { readFile, writeFile } from "node:fs/promises";
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader, ZipWriter } from "@zip.js/zip.js";
import { GraphifMcpError, isNodeError } from "../errors.js";

export interface PrgArchive {
  entries: string[];
  files: Map<string, Uint8Array>;
}

export async function readPrgArchive(path: string): Promise<PrgArchive> {
  let bytes: Uint8Array;
  try {
    bytes = await readFile(path);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new GraphifMcpError("FILE_NOT_FOUND", `File not found: ${path}`, { path });
    }
    throw error;
  }

  const reader = new ZipReader(new Uint8ArrayReader(bytes));
  try {
    const entries = await reader.getEntries();
    const files = new Map<string, Uint8Array>();
    for (const entry of entries) {
      if (entry.directory) continue;
      const data = await entry.getData(new Uint8ArrayWriter());
      files.set(entry.filename, data);
    }
    return {
      entries: [...files.keys()],
      files,
    };
  } catch (error) {
    throw new GraphifMcpError("INVALID_ARCHIVE", `Invalid .prg archive: ${path}`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await reader.close();
  }
}

export async function writePrgArchive(path: string, files: Map<string, Uint8Array>): Promise<void> {
  const zipWriter = new ZipWriter(new Uint8ArrayWriter());
  for (const [filename, bytes] of files) {
    await zipWriter.add(filename, new Uint8ArrayReader(bytes));
  }
  const output = await zipWriter.close();
  await writeFile(path, output);
}
