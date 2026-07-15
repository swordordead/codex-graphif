import { readFile, writeFile } from "node:fs/promises";
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader, ZipWriter } from "@zip.js/zip.js";

export interface PrgArchive {
  entries: string[];
  files: Map<string, Uint8Array>;
}

export async function readPrgArchive(path: string): Promise<PrgArchive> {
  const bytes = await readFile(path);
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
