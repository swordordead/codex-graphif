import type { LiveBridge } from "../liveBridge/bridge.js";

export function liveStatus(bridge: LiveBridge) {
  return bridge.status();
}
