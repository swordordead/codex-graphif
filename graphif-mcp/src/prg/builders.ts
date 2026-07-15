import { randomUUID } from "node:crypto";
import type { SerializedEntry } from "./types.js";

export function buildTextNode(input: { text: string; x: number; y: number; uuid?: string }): SerializedEntry {
  return {
    _: "TextNode",
    details: [],
    uuid: input.uuid ?? randomUUID(),
    text: input.text,
    collisionBox: {
      _: "CollisionBox",
      shapes: [
        {
          _: "Rectangle",
          location: {
            _: "Vector",
            x: input.x,
            y: input.y,
          },
          size: {
            _: "Vector",
            x: 120,
            y: 76,
          },
        },
      ],
    },
    color: {
      _: "Color",
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    },
    fontScaleLevel: 0,
    sizeAdjust: "auto",
    fontFamily: "",
    fontWeight: "",
  };
}

export function buildLineEdge(input: {
  sourceIndex: number;
  targetIndex: number;
  text?: string;
  uuid?: string;
}): SerializedEntry {
  return {
    _: "LineEdge",
    associationList: [{ $: `/${input.sourceIndex}` }, { $: `/${input.targetIndex}` }],
    color: {
      _: "Color",
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    },
    targetRectangleRate: {
      _: "Vector",
      x: 0.01,
      y: 0.5,
    },
    sourceRectangleRate: {
      _: "Vector",
      x: 0.99,
      y: 0.5,
    },
    uuid: input.uuid ?? randomUUID(),
    text: input.text ?? "",
    lineType: "solid",
    arrowType: "default",
  };
}
