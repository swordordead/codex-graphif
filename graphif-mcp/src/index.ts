export const serverName = "graphif-mcp";

export const toolNames = [
  "inspect_prg",
  "export_json",
  "create_prg",
  "update_text_node",
  "add_text_node",
  "add_line_edge",
] as const;

export { addLineEdge } from "./tools/addLineEdge.js";
export { addTextNode } from "./tools/addTextNode.js";
export { createPrg } from "./tools/createPrg.js";
export { exportJson } from "./tools/exportJson.js";
export { inspectPrg } from "./tools/inspectPrg.js";
export { updateTextNode } from "./tools/updateTextNode.js";
