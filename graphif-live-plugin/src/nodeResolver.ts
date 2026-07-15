export function resolveTextNode(nodeId: string): TextNode {
  const nodes = prg.project.stageManager.getTextNodes();
  const byUuid = nodes.find((node) => node.uuid === nodeId);
  if (byUuid) return byUuid;

  const byText = nodes.filter((node) => node.text === nodeId);
  if (byText.length === 1) return byText[0];
  if (byText.length > 1) {
    throw commandError("AMBIGUOUS_NODE", `Multiple text nodes match: ${nodeId}`);
  }
  throw commandError("NODE_NOT_FOUND", `Text node not found: ${nodeId}`);
}

export function commandError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}
