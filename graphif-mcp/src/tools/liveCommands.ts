import { buildBeidouOperations, type BeidouOptions } from "../liveBridge/beidou.js";
import type { LiveBridge } from "../liveBridge/bridge.js";

export function liveListNodes(bridge: LiveBridge) {
  return bridge.sendCommand("list_nodes", {});
}

export function liveListEdges(bridge: LiveBridge) {
  return bridge.sendCommand("list_edges", {});
}

export function liveAddTextNode(
  bridge: LiveBridge,
  input: { text: string; x: number; y: number; select?: boolean },
) {
  return bridge.sendCommand("add_text_node", input);
}

export function liveMoveNode(bridge: LiveBridge, input: { nodeId: string; x: number; y: number }) {
  return bridge.sendCommand("move_node", input);
}

export function liveRenameNode(bridge: LiveBridge, input: { nodeId: string; text: string }) {
  return bridge.sendCommand("rename_node", input);
}

export function liveAddEdge(bridge: LiveBridge, input: { sourceId: string; targetId: string; text?: string }) {
  return bridge.sendCommand("add_edge", input);
}

export function liveCreateBeidou(bridge: LiveBridge, input: BeidouOptions = {}) {
  return bridge.sendCommand("create_beidou", buildBeidouOperations(input));
}
