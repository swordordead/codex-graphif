export interface LiveCommandRequest {
  id: string;
  type: "command";
  command: string;
  payload: unknown;
}

export interface LiveCommandSuccess {
  id: string;
  ok: true;
  result: unknown;
}

export interface LiveCommandError {
  id: string;
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type LiveCommandResponse = LiveCommandSuccess | LiveCommandError;
