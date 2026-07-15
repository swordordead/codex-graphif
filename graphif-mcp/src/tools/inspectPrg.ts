import { readStage } from "../prg/stage.js";

export async function inspectPrg(path: string) {
  const stage = await readStage(path);
  return {
    path,
    version: stage.metadata.version ?? null,
    nodeCount: stage.textNodes.length,
    edgeCount: stage.lineEdges.length,
    unsupportedEntries: stage.unsupportedEntries,
    textNodes: stage.textNodes,
    lineEdges: stage.lineEdges,
  };
}
