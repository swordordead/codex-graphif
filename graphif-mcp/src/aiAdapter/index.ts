export interface AiAdapterCapabilities {
  available: boolean;
  capabilities: string[];
  reason: string;
}

export function isAvailable(): boolean {
  return false;
}

export function describeCapabilities(): AiAdapterCapabilities {
  return {
    available: false,
    capabilities: [],
    reason: "Graphif exposes an AI configuration entry, but no external API bridge is configured in this MCP server.",
  };
}
