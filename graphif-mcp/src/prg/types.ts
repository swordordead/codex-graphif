export interface GraphifMetadata {
  version?: string;
}

export interface TextNode {
  id: string;
  index: number;
  uuid: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineEdge {
  index: number;
  uuid: string;
  text: string;
  sourceId: string | null;
  targetId: string | null;
  sourceIndex: number | null;
  targetIndex: number | null;
  lineType: string;
  arrowType: string;
}

export interface GraphStage {
  metadata: GraphifMetadata;
  textNodes: TextNode[];
  lineEdges: LineEdge[];
  unsupportedEntries: number;
  rawEntries: unknown[];
}

export type SerializedEntry = Record<string, unknown>;
