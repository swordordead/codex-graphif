import envPaths from "env-paths";
import { cp, mkdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
await access(join(distDir, "extension.js"));
await access(join(distDir, "metadata.msgpack"));

const manifest = JSON.parse(await readFile("package.json", "utf-8"));
const dataDir = envPaths("liren.project-graph", { suffix: "" }).data;
const targetDir = join(dataDir, "extensions", manifest.name);

await mkdir(join(dataDir, "extensions"), { recursive: true });
await cp(distDir, targetDir, {
  recursive: true,
  force: true,
});

console.log(`Installed ${manifest.name} to ${targetDir}`);
