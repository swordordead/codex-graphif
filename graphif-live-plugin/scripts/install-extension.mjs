import envPaths from "env-paths";
import { cp, mkdir, readFile, access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = "dist";
await access(join(distDir, "extension.js"));
await access(join(distDir, "metadata.msgpack"));

const manifest = JSON.parse(await readFile("package.json", "utf-8"));
const dataDir = envPaths("liren.project-graph", { suffix: "" }).data;
const targetDir = join(dataDir, "extensions", manifest.name);
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const mcpServerPath = join(repoRoot, "graphif-mcp", "dist", "server.js").replaceAll("\\", "/");

await mkdir(join(dataDir, "extensions"), { recursive: true });
await cp(distDir, targetDir, {
  recursive: true,
  force: true,
});

await writeFile(
  join(targetDir, ".mcp.json"),
  JSON.stringify(
    {
      mcpServers: {
        graphif: {
          command: "node",
          args: [mcpServerPath],
        },
      },
    },
    null,
    2,
  ),
  "utf-8",
);

console.log(`Installed ${manifest.name} to ${targetDir}`);
console.log(`Wrote MCP config for ${mcpServerPath}`);
