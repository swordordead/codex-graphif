import { decode, encode } from "@msgpack/msgpack";

export function decodeMsgpack<T>(bytes: Uint8Array): T {
  return decode(bytes) as T;
}

export function encodeMsgpack<T>(value: T): Uint8Array {
  return encode(value);
}
