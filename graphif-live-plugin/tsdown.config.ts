import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  outDir: "dist",
});
