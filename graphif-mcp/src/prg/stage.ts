import { readPrgArchive } from "./archive.js";
import { decodeMsgpack } from "./msgpack.js";
import { GraphifMcpError } from "../errors.js";
import type { GraphStage, GraphifMetadata, LineEdge, SerializedEntry, TextNode } from "./types.js";

const STAGE_ENTRY = "stage.msgpack";
const METADATA_ENTRY = "metadata.msgpack";

export async function readStage(path: string): Promise<GraphStage> {
  const archive = await readPrgArchive(path);
  const stageBytes = archive.files.get(STAGE_ENTRY);
  if (!stageBytes) {
    throw new GraphifMcpError("UNSUPPORTED_STAGE", `Missing ${STAGE_ENTRY} in ${path}`);
  }

  const rawEntries = decodeMsgpack<unknown>(stageBytes);
  if (!Array.isArray(rawEntries)) {
    throw new GraphifMcpError("UNSUPPORTED_STAGE", `${STAGE_ENTRY} must contain an array`);
  }

  const metadataBytes = archive.files.get(METADATA_ENTRY);
  const metadata = metadataBytes ? decodeMsgpack<GraphifMetadata>(metadataBytes) : {};
  return parseStage(rawEntries, metadata);
}

export function parseStage(rawEntries: unknown[], metadata: GraphifMetadata = {}): GraphStage {
  const textNodes: TextNode[] = [];
  const textNodesByIndex = new Map<number, TextNode>();
  let unsupportedEntries = 0;

  rawEntries.forEach((entry, index) => {
    if (!isEntry(entry)) {
      unsupportedEntries += 1;
      return;
    }
    if (entry._ !== "TextNode") {
      return;
    }
    const textNode = parseTextNode(entry, index);
    textNodes.push(textNode);
    textNodesByIndex.set(index, textNode);
  });

  const lineEdges: LineEdge[] = [];
  rawEntries.forEach((entry, index) => {
    if (!isEntry(entry)) {
      return;
    }
    if (entry._ === "TextNode") {
      return;
    }
    if (entry._ !== "LineEdge") {
      unsupportedEntries += 1;
      return;
    }
    lineEdges.push(parseLineEdge(entry, index, textNodesByIndex));
  });

  return {
    metadata,
    textNodes,
    lineEdges,
    unsupportedEntries,
    rawEntries,
  };
}

function parseTextNode(entry: SerializedEntry, index: number): TextNode {
  const uuid = readString(entry.uuid, `node-${index}`);
  const text = readString(entry.text, "");
  const rectangle = getPrimaryRectangle(entry);
  return {
    id: text.trim() || uuid,
    index,
    uuid,
    text,
    x: readNumber(rectangle.location?.x, 0),
    y: readNumber(rectangle.location?.y, 0),
    width: readNumber(rectangle.size?.x, 0),
    height: readNumber(rectangle.size?.y, 0),
  };
}

function parseLineEdge(entry: SerializedEntry, index: number, textNodesByIndex: Map<number, TextNode>): LineEdge {
  const associationList = Array.isArray(entry.associationList) ? entry.associationList : [];
  const sourceIndex = parseRefIndex(associationList[0]);
  const targetIndex = parseRefIndex(associationList[1]);
  return {
    index,
    uuid: readString(entry.uuid, `edge-${index}`),
    text: readString(entry.text, ""),
    sourceId: sourceIndex === null ? null : textNodesByIndex.get(sourceIndex)?.id ?? null,
    targetId: targetIndex === null ? null : textNodesByIndex.get(targetIndex)?.id ?? null,
    sourceIndex,
    targetIndex,
    lineType: readString(entry.lineType, "solid"),
    arrowType: readString(entry.arrowType, "default"),
  };
}

function parseRefIndex(value: unknown): number | null {
  if (!isEntry(value) || typeof value.$ !== "string") {
    return null;
  }
  const match = value.$.match(/^\/(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getPrimaryRectangle(entry: SerializedEntry): {
  location?: { x?: unknown; y?: unknown };
  size?: { x?: unknown; y?: unknown };
} {
  const collisionBox = isEntry(entry.collisionBox) ? entry.collisionBox : {};
  const shapes = Array.isArray(collisionBox.shapes) ? collisionBox.shapes : [];
  const rectangle = isEntry(shapes[0]) ? shapes[0] : {};
  return {
    location: isEntry(rectangle.location) ? rectangle.location : undefined,
    size: isEntry(rectangle.size) ? rectangle.size : undefined,
  };
}

function isEntry(value: unknown): value is SerializedEntry {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
