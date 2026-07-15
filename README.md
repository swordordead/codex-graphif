# Graphif MCP

Graphif MCP 是一个本地 MCP 服务，用来让 Codex 读取、生成和修改 Graphif `.prg` 文件。第一版只做文件级操作：Codex 通过 MCP 改当前项目里的 `.prg`，Graphif 负责打开这些文件查看和继续编辑。

## 技术栈

- Node.js 24+
- TypeScript
- npm workspaces
- MCP SDK
- `@zip.js/zip.js`
- `@msgpack/msgpack`
- Vitest

## 启动方式

安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

构建：

```bash
npm run build
```

启动 MCP 服务：

```bash
npm start
```

Windows 可双击运行：

```text
start.bat
```

这个项目是 stdio MCP 服务，不占用 HTTP 端口，也不会自动打开浏览器。

## MCP 配置示例

构建后，MCP server 入口是：

```text
graphif-mcp/dist/server.js
```

客户端配置示例：

```json
{
  "mcpServers": {
    "graphif": {
      "command": "node",
      "args": [
        "C:/Users/Administrator/Documents/Codex/2026-07-15/woy/graphif-mcp/dist/server.js"
      ]
    }
  }
}
```

## 工具

- `inspect_prg`：读取 `.prg` 的节点、连线和版本信息
- `export_json`：导出 JSON 安全结构
- `create_prg`：根据节点和连线创建 `.prg`
- `update_text_node`：修改文字节点，默认写入 `.generated.prg`
- `add_text_node`：追加文字节点
- `add_line_edge`：追加连线

## 目录结构

```text
.
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── graphif-mcp/
│   ├── src/
│   │   ├── aiAdapter/
│   │   ├── prg/
│   │   ├── tools/
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   └── server.ts
│   └── tests/
├── package.json
└── start.bat
```

## 部署说明

1. 在本项目根目录执行 `npm install`
2. 执行 `npm run build`
3. 把 `node graphif-mcp/dist/server.js` 配到支持 MCP 的客户端
4. 在客户端中调用 Graphif MCP 工具读写 `.prg`

当前版本不实时控制已经打开的 Graphif 软件窗口，也不调用 Graphif UI 中的 AI 配置入口。`aiAdapter` 只作为后续扩展边界保留。
