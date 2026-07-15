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
import { updateTextNode } from "./tools/updateTextNode.js";
import { serverName } from "./index.js";

export function createGraphifMcpServer(): McpServer {
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

  return server;
}

export async function main(): Promise<void> {
  const server = createGraphifMcpServer();
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
