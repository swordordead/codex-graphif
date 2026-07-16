export function resolveTextNode(nodeId: string): TextNode {
  const node = prg.project.stageManager.getTextNodeByUUID(nodeId);
  if (node) return node;
  throw commandError("NODE_NOT_FOUND", `Text node not found by UUID: ${nodeId}`);
}

export function commandError(code: string, message: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}
