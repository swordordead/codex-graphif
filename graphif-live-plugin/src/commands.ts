import { commandError, resolveTextNode } from "./nodeResolver";

interface AddTextNodePayload {
  text: string;
  x: number;
  y: number;
  select?: boolean;
}

interface MoveNodePayload {
  nodeId: string;
  x: number;
  y: number;
}

interface RenameNodePayload {
  nodeId: string;
  text: string;
}

interface AddEdgePayload {
  sourceId: string;
  targetId: string;
  text?: string;
}

interface BeidouPayload {
  nodes: AddTextNodePayload[];
  edges: AddEdgePayload[];
}

export async function handleCommand(command: string, payload: unknown): Promise<unknown> {
  switch (command) {
    case "ping":
      return { pong: true };
    case "list_nodes":
      return listNodes();
    case "list_edges":
      return listEdges();
    case "add_text_node":
      return addTextNode(payload as AddTextNodePayload);
    case "move_node":
      return moveNode(payload as MoveNodePayload);
    case "rename_node":
      return renameNode(payload as RenameNodePayload);
    case "add_edge":
      return addEdge(payload as AddEdgePayload);
    case "create_beidou":
      return createBeidou(payload as BeidouPayload);
    default:
      throw commandError("UNKNOWN_COMMAND", `Unknown live command: ${command}`);
  }
}

function listNodes() {
  return {
    nodes: prg.project.stageManager.getTextNodes().map(formatTextNode),
  };
}

function listEdges() {
  return {
    edges: prg.project.stageManager.getLineEdges().map((edge) => ({
      uuid: edge.uuid,
      text: edge.text,
      sourceUuid: edge.source?.uuid ?? null,
      targetUuid: edge.target?.uuid ?? null,
    })),
  };
}

async function addTextNode(payload: AddTextNodePayload) {
  const uuid = await prg.project.nodeAdder.addTextNodeByClick(
    { _: "Vector", x: payload.x, y: payload.y },
    [],
    payload.select ?? false,
    true,
    undefined,
  );
  const node = prg.project.stageManager.getTextNodeByUUID(uuid);
  if (!node) {
    throw commandError("NODE_NOT_FOUND", `Created node cannot be found: ${uuid}`);
  }
  if (node.text !== payload.text) {
    node.rename(payload.text);
  }
  return formatTextNode(node);
}

function moveNode(payload: MoveNodePayload) {
  const node = resolveTextNode(payload.nodeId);
  node.moveTo({ _: "Vector", x: payload.x, y: payload.y });
  return formatTextNode(node);
}

function renameNode(payload: RenameNodePayload) {
  const node = resolveTextNode(payload.nodeId);
  node.rename(payload.text);
  return formatTextNode(node);
}

function addEdge(payload: AddEdgePayload) {
  const source = resolveTextNode(payload.sourceId);
  const target = resolveTextNode(payload.targetId);
  prg.project.nodeConnector.connectConnectableEntity(source, target, payload.text ?? "", undefined, undefined);
  return {
    sourceUuid: source.uuid,
    targetUuid: target.uuid,
    text: payload.text ?? "",
  };
}

async function createBeidou(payload: BeidouPayload) {
  for (const node of payload.nodes) {
    await addTextNode(node);
  }
  for (const edge of payload.edges) {
    addEdge(edge);
  }
  return {
    nodeCount: payload.nodes.length,
    edgeCount: payload.edges.length,
  };
}

function formatTextNode(node: TextNode) {
  return {
    uuid: node.uuid,
    text: node.text,
    x: node.rectangle.location.x,
    y: node.rectangle.location.y,
    width: node.rectangle.size.x,
    height: node.rectangle.size.y,
  };
}
