export const serverName = "graphif-mcp";

export const toolNames = [
  "inspect_prg",
  "export_json",
  "create_prg",
  "update_text_node",
  "add_text_node",
  "add_line_edge",
  "live_status",
  "live_list_nodes",
  "live_list_edges",
  "live_add_text_node",
  "live_move_node",
  "live_rename_node",
  "live_add_edge",
  "live_create_beidou",
] as const;

export { addLineEdge } from "./tools/addLineEdge.js";
export { addTextNode } from "./tools/addTextNode.js";
export { createPrg } from "./tools/createPrg.js";
export { exportJson } from "./tools/exportJson.js";
export { inspectPrg } from "./tools/inspectPrg.js";
export { updateTextNode } from "./tools/updateTextNode.js";
export { describeCapabilities, isAvailable } from "./aiAdapter/index.js";
export { buildBeidouOperations } from "./liveBridge/beidou.js";
export { LiveBridge } from "./liveBridge/bridge.js";
