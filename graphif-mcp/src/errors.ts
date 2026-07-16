export type GraphifMcpErrorCode =
  | "FILE_NOT_FOUND"
  | "INVALID_ARCHIVE"
  | "UNSUPPORTED_STAGE"
  | "NODE_NOT_FOUND"
  | "GRAPHIF_NOT_CONNECTED"
  | "GRAPHIF_RECONNECTED"
  | "GRAPHIF_DISCONNECTED"
  | "LIVE_COMMAND_FAILED"
  | "LIVE_COMMAND_TIMEOUT"
  | "INVALID_INPUT";

export class GraphifMcpError extends Error {
  constructor(
    public code: GraphifMcpErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "GraphifMcpError";
  }
}

export function normalizeError(error: unknown, fallbackCode: GraphifMcpErrorCode = "INVALID_INPUT"): GraphifMcpError {
  if (error instanceof GraphifMcpError) {
    return error;
  }
  if (isNodeError(error) && error.code === "ENOENT") {
    return new GraphifMcpError("FILE_NOT_FOUND", error.message, { path: error.path });
  }
  return new GraphifMcpError(fallbackCode, error instanceof Error ? error.message : String(error));
}

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
