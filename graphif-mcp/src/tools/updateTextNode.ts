import { updateTextNodeFile } from "../prg/document.js";

export async function updateTextNode(path: string, nodeId: string, text: string, outputPath?: string) {
  const result = await updateTextNodeFile(path, nodeId, text, outputPath);
  return {
    outputPath: result.outputPath,
    nodeCount: result.stage.textNodes.length,
    edgeCount: result.stage.lineEdges.length,
    textNodes: result.stage.textNodes,
  };
}
