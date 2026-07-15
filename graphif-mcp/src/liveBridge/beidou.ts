export interface BeidouOptions {
  originX?: number;
  originY?: number;
  scale?: number;
}

export interface BeidouNodeOperation {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface BeidouEdgeOperation {
  sourceId: string;
  targetId: string;
}

export interface BeidouOperations {
  nodes: BeidouNodeOperation[];
  edges: BeidouEdgeOperation[];
}

const baseNodes = [
  { id: "天枢", text: "天枢", x: 0, y: 0 },
  { id: "天璇", text: "天璇", x: 120, y: -45 },
  { id: "天玑", text: "天玑", x: 225, y: 20 },
  { id: "天权", text: "天权", x: 115, y: 90 },
  { id: "玉衡", text: "玉衡", x: 330, y: 80 },
  { id: "开阳", text: "开阳", x: 450, y: 135 },
  { id: "摇光", text: "摇光", x: 575, y: 205 },
];

const baseEdges = [
  { sourceId: "天枢", targetId: "天璇" },
  { sourceId: "天璇", targetId: "天玑" },
  { sourceId: "天玑", targetId: "天权" },
  { sourceId: "天权", targetId: "玉衡" },
  { sourceId: "玉衡", targetId: "开阳" },
  { sourceId: "开阳", targetId: "摇光" },
];

export function buildBeidouOperations(options: BeidouOptions = {}): BeidouOperations {
  const originX = options.originX ?? 0;
  const originY = options.originY ?? 0;
  const scale = options.scale ?? 1;
  return {
    nodes: baseNodes.map((node) => ({
      ...node,
      x: originX + node.x * scale,
      y: originY + node.y * scale,
    })),
    edges: [...baseEdges],
  };
}
