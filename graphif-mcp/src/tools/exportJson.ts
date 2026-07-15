import { inspectPrg } from "./inspectPrg.js";

export async function exportJson(path: string) {
  return inspectPrg(path);
}
