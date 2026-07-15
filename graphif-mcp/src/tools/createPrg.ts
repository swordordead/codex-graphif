import { createPrgFile, type CreateEdgeInput, type CreateNodeInput } from "../prg/document.js";

export async function createPrg(path: string, nodes: CreateNodeInput[], edges: CreateEdgeInput[] = []) {
  const stage = await createPrgFile(path, nodes, edges);
  return {
    path,
    nodeCount: stage.textNodes.length,
    edgeCount: stage.lineEdges.length,
    textNodes: stage.textNodes,
    lineEdges: stage.lineEdges,
  };
}
