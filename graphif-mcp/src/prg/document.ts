import { extname } from "node:path";
import { GraphifMcpError } from "../errors.js";
import { readPrgArchive, writePrgArchive } from "./archive.js";
import { buildLineEdge, buildTextNode } from "./builders.js";
import { decodeMsgpack, encodeMsgpack } from "./msgpack.js";
import { parseStage } from "./stage.js";
import type { GraphStage, GraphifMetadata, SerializedEntry } from "./types.js";

const STAGE_ENTRY = "stage.msgpack";
const METADATA_ENTRY = "metadata.msgpack";
const TAGS_ENTRY = "tags.msgpack";
const REFERENCE_ENTRY = "reference.msgpack";
const THUMBNAIL_ENTRY = "thumbnail.png";

const FALLBACK_THUMBNAIL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lwzLwAAAAABJRU5ErkJggg==",
  "base64",
);

export interface CreateNodeInput {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface CreateEdgeInput {
  sourceId: string;
  targetId: string;
  text?: string;
}

interface PrgDocument {
  files: Map<string, Uint8Array>;
  rawEntries: SerializedEntry[];
  metadata: GraphifMetadata;
}

export async function readPrgDocument(path: string): Promise<PrgDocument> {
  const archive = await readPrgArchive(path);
  const stageBytes = archive.files.get(STAGE_ENTRY);
  if (!stageBytes) {
    throw new GraphifMcpError("UNSUPPORTED_STAGE", `Missing ${STAGE_ENTRY} in ${path}`);
  }

  const rawEntries = decodeMsgpack<unknown>(stageBytes);
  if (!Array.isArray(rawEntries) || !rawEntries.every(isSerializedEntry)) {
    throw new GraphifMcpError("UNSUPPORTED_STAGE", `${STAGE_ENTRY} must contain serialized Graphif entries`);
  }

  const metadataBytes = archive.files.get(METADATA_ENTRY);
  const metadata = metadataBytes ? decodeMsgpack<GraphifMetadata>(metadataBytes) : {};
  return {
    files: archive.files,
    rawEntries,
    metadata,
  };
}

export async function createPrgFile(path: string, nodes: CreateNodeInput[], edges: CreateEdgeInput[]): Promise<GraphStage> {
  const rawEntries: SerializedEntry[] = nodes.map((node) =>
    buildTextNode({
      text: node.text,
      x: node.x,
      y: node.y,
    }),
  );
  const nodeIndexById = new Map<string, number>();
  nodes.forEach((node, index) => nodeIndexById.set(node.id, index));

  for (const edge of edges) {
    const sourceIndex = nodeIndexById.get(edge.sourceId);
    const targetIndex = nodeIndexById.get(edge.targetId);
    if (sourceIndex === undefined || targetIndex === undefined) {
      throw new GraphifMcpError(
        "NODE_NOT_FOUND",
        `Cannot create edge ${edge.sourceId} -> ${edge.targetId}: node id not found`,
      );
    }
    rawEntries.push(
      buildLineEdge({
        sourceIndex,
        targetIndex,
        text: edge.text,
      }),
    );
  }

  const metadata = { version: "2.6.0" };
  const files = new Map<string, Uint8Array>([
    [STAGE_ENTRY, encodeMsgpack(rawEntries)],
    [METADATA_ENTRY, encodeMsgpack(metadata)],
    [TAGS_ENTRY, encodeMsgpack([])],
    [REFERENCE_ENTRY, encodeMsgpack({ sections: {}, files: [] })],
    [THUMBNAIL_ENTRY, FALLBACK_THUMBNAIL_PNG],
  ]);
  await writePrgArchive(path, files);
  return parseStage(rawEntries, metadata);
}

export async function updateTextNodeFile(
  path: string,
  nodeId: string,
  text: string,
  outputPath = toGeneratedPath(path),
): Promise<{ outputPath: string; stage: GraphStage }> {
  const document = await readPrgDocument(path);
  const stage = parseStage(document.rawEntries, document.metadata);
  const node = stage.textNodes.find((candidate) => candidate.id === nodeId || candidate.uuid === nodeId);
  if (!node) {
    throw new GraphifMcpError("NODE_NOT_FOUND", `Text node not found: ${nodeId}`);
  }
  document.rawEntries[node.index].text = text;
  await writeStageDocument(outputPath, document);
  return {
    outputPath,
    stage: parseStage(document.rawEntries, document.metadata),
  };
}

export async function addTextNodeFile(
  path: string,
  input: CreateNodeInput,
  outputPath = toGeneratedPath(path),
): Promise<{ outputPath: string; stage: GraphStage }> {
  const document = await readPrgDocument(path);
  document.rawEntries.push(buildTextNode(input));
  await writeStageDocument(outputPath, document);
  return {
    outputPath,
    stage: parseStage(document.rawEntries, document.metadata),
  };
}

export async function addLineEdgeFile(
  path: string,
  input: CreateEdgeInput,
  outputPath = toGeneratedPath(path),
): Promise<{ outputPath: string; stage: GraphStage }> {
  const document = await readPrgDocument(path);
  const stage = parseStage(document.rawEntries, document.metadata);
  const source = stage.textNodes.find((node) => node.id === input.sourceId || node.uuid === input.sourceId);
  const target = stage.textNodes.find((node) => node.id === input.targetId || node.uuid === input.targetId);
  if (!source || !target) {
    throw new GraphifMcpError(
      "NODE_NOT_FOUND",
      `Cannot add edge ${input.sourceId} -> ${input.targetId}: node id not found`,
    );
  }
  document.rawEntries.push(
    buildLineEdge({
      sourceIndex: source.index,
      targetIndex: target.index,
      text: input.text,
    }),
  );
  await writeStageDocument(outputPath, document);
  return {
    outputPath,
    stage: parseStage(document.rawEntries, document.metadata),
  };
}

export function toGeneratedPath(path: string): string {
  const extension = extname(path) || ".prg";
  return `${path.slice(0, -extension.length)}.generated${extension}`;
}

async function writeStageDocument(path: string, document: PrgDocument): Promise<void> {
  document.files.set(STAGE_ENTRY, encodeMsgpack(document.rawEntries));
  document.files.set(METADATA_ENTRY, encodeMsgpack(document.metadata.version ? document.metadata : { version: "2.6.0" }));
  if (!document.files.has(TAGS_ENTRY)) {
    document.files.set(TAGS_ENTRY, encodeMsgpack([]));
  }
  if (!document.files.has(REFERENCE_ENTRY)) {
    document.files.set(REFERENCE_ENTRY, encodeMsgpack({ sections: {}, files: [] }));
  }
  if (!document.files.has(THUMBNAIL_ENTRY)) {
    document.files.set(THUMBNAIL_ENTRY, FALLBACK_THUMBNAIL_PNG);
  }
  await writePrgArchive(path, document.files);
}

function isSerializedEntry(value: unknown): value is SerializedEntry {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
