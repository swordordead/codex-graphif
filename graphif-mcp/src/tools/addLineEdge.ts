import { addLineEdgeFile, type CreateEdgeInput } from "../prg/document.js";

export async function addLineEdge(path: string, input: CreateEdgeInput, outputPath?: string) {
  const result = await addLineEdgeFile(path, input, outputPath);
  return {
    outputPath: result.outputPath,
    nodeCount: result.stage.textNodes.length,
    edgeCount: result.stage.lineEdges.length,
    lineEdges: result.stage.lineEdges,
  };
}
