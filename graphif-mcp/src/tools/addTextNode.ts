import { addTextNodeFile, type CreateNodeInput } from "../prg/document.js";

export async function addTextNode(path: string, input: CreateNodeInput, outputPath?: string) {
  const result = await addTextNodeFile(path, input, outputPath);
  return {
    outputPath: result.outputPath,
    nodeCount: result.stage.textNodes.length,
    edgeCount: result.stage.lineEdges.length,
    textNodes: result.stage.textNodes,
  };
}
