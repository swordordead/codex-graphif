#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { normalizeError } from "./errors.js";
import { addLineEdge } from "./tools/addLineEdge.js";
import { addTextNode } from "./tools/addTextNode.js";
import { createPrg } from "./tools/createPrg.js";
import { exportJson } from "./tools/exportJson.js";
import { inspectPrg } from "./tools/inspectPrg.js";
import {
  liveAddEdge,
  liveAddTextNode,
  liveCreateBeidou,
  liveListEdges,
  liveListNodes,
  liveMoveNode,
  liveRenameNode,
} from "./tools/liveCommands.js";
import { liveStatus } from "./tools/liveStatus.js";
import { updateTextNode } from "./tools/updateTextNode.js";
import { serverName } from "./index.js";
import { LiveBridge } from "./liveBridge/bridge.js";

export function createGraphifMcpServer(bridge = new LiveBridge({ port: 17321 })): McpServer {
  const server = new McpServer({
    name: serverName,
    version: "0.1.0",
  });

  server.registerTool(
    "inspect_prg",
    {
      title: "Inspect Graphif PRG",
      description: "Read a Graphif .prg file and return nodes, edges, and metadata.",
      inputSchema: {
        path: z.string(),
      },
    },
    async ({ path }) => toSafeToolResult(() => inspectPrg(path)),
  );

  server.registerTool(
    "export_json",
    {
      title: "Export Graphif PRG as JSON",
      description: "Return a JSON-safe representation of a Graphif .prg file.",
      inputSchema: {
        path: z.string(),
      },
    },
    async ({ path }) => toSafeToolResult(() => exportJson(path)),
  );

  server.registerTool(
    "create_prg",
    {
      title: "Create Graphif PRG",
      description: "Create a new Graphif .prg file from text nodes and line edges.",
      inputSchema: {
        path: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            x: z.number(),
            y: z.number(),
          }),
        ),
        edges: z
          .array(
            z.object({
              sourceId: z.string(),
              targetId: z.string(),
              text: z.string().optional(),
            }),
          )
          .default([]),
      },
    },
    async ({ path, nodes, edges }) => toSafeToolResult(() => createPrg(path, nodes, edges)),
  );

  server.registerTool(
    "update_text_node",
    {
      title: "Update Graphif Text Node",
      description: "Update a text node and write a generated .prg file by default.",
      inputSchema: {
        path: z.string(),
        nodeId: z.string(),
        text: z.string(),
        outputPath: z.string().optional(),
      },
    },
    async ({ path, nodeId, text, outputPath }) => toSafeToolResult(() => updateTextNode(path, nodeId, text, outputPath)),
  );

  server.registerTool(
    "add_text_node",
    {
      title: "Add Graphif Text Node",
      description: "Add a text node and write a generated .prg file by default.",
      inputSchema: {
        path: z.string(),
        id: z.string(),
        text: z.string(),
        x: z.number(),
        y: z.number(),
        outputPath: z.string().optional(),
      },
    },
    async ({ path, id, text, x, y, outputPath }) =>
      toSafeToolResult(() => addTextNode(path, { id, text, x, y }, outputPath)),
  );

  server.registerTool(
    "add_line_edge",
    {
      title: "Add Graphif Line Edge",
      description: "Add a line edge between two text nodes and write a generated .prg file by default.",
      inputSchema: {
        path: z.string(),
        sourceId: z.string(),
        targetId: z.string(),
        text: z.string().optional(),
        outputPath: z.string().optional(),
      },
    },
    async ({ path, sourceId, targetId, text, outputPath }) =>
      toSafeToolResult(() => addLineEdge(path, { sourceId, targetId, text }, outputPath)),
  );

  server.registerTool(
    "live_status",
    {
      title: "Graphif Live Status",
      description: "Check whether the Graphif live plugin is connected.",
      inputSchema: {},
    },
    async () => toToolResult(liveStatus(bridge)),
  );

  server.registerTool(
    "live_list_nodes",
    {
      title: "List Live Graphif Nodes",
      description: "List text nodes from the active Graphif canvas.",
      inputSchema: {},
    },
    async () => toSafeToolResult(() => liveListNodes(bridge)),
  );

  server.registerTool(
    "live_list_edges",
    {
      title: "List Live Graphif Edges",
      description: "List line edges from the active Graphif canvas.",
      inputSchema: {},
    },
    async () => toSafeToolResult(() => liveListEdges(bridge)),
  );

  server.registerTool(
    "live_add_text_node",
    {
      title: "Add Live Graphif Text Node",
      description: "Add a text node to the active Graphif canvas.",
      inputSchema: {
        text: z.string(),
        x: z.number(),
        y: z.number(),
        select: z.boolean().optional(),
      },
    },
    async (input) => toSafeToolResult(() => liveAddTextNode(bridge, input)),
  );

  server.registerTool(
    "live_move_node",
    {
      title: "Move Live Graphif Node",
      description: "Move a text node in the active Graphif canvas.",
      inputSchema: {
        nodeId: z.string(),
        x: z.number(),
        y: z.number(),
      },
    },
    async (input) => toSafeToolResult(() => liveMoveNode(bridge, input)),
  );

  server.registerTool(
    "live_rename_node",
    {
      title: "Rename Live Graphif Node",
      description: "Rename a text node in the active Graphif canvas.",
      inputSchema: {
        nodeId: z.string(),
        text: z.string(),
      },
    },
    async (input) => toSafeToolResult(() => liveRenameNode(bridge, input)),
  );

  server.registerTool(
    "live_add_edge",
    {
      title: "Add Live Graphif Edge",
      description: "Connect two text nodes in the active Graphif canvas.",
      inputSchema: {
        sourceId: z.string(),
        targetId: z.string(),
        text: z.string().optional(),
      },
    },
    async (input) => toSafeToolResult(() => liveAddEdge(bridge, input)),
  );

  server.registerTool(
    "live_create_beidou",
    {
      title: "Create Beidou Graph Live",
      description: "Create a Beidou constellation graph in the active Graphif canvas.",
      inputSchema: {
        originX: z.number().optional(),
        originY: z.number().optional(),
        scale: z.number().optional(),
      },
    },
    async (input) => toSafeToolResult(() => liveCreateBeidou(bridge, input)),
  );

  return server;
}

export async function main(): Promise<void> {
  const bridge = new LiveBridge({ port: 17321 });
  await bridge.start();
  const server = createGraphifMcpServer(bridge);
  await server.connect(new StdioServerTransport());
}

async function toSafeToolResult(read: () => Promise<unknown>) {
  try {
    return toToolResult(await read());
  } catch (error) {
    const normalized = normalizeError(error);
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: {
                code: normalized.code,
                message: normalized.message,
                details: normalized.details ?? null,
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

function toToolResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
