# Graphif MCP Design

Date: 2026-07-15

## Summary

Build a local MCP server that lets Codex inspect, create, and modify Graphif `.prg` files inside the current project. Graphif remains the viewer/editor for opening the generated `.prg` files. Codex uses the MCP tools to make deterministic file-level graph changes.

The first version focuses on file operations, not live control of an already-open Graphif window.

## Goals

- Let Codex read a Graphif `.prg` file and return its nodes, edges, and metadata.
- Let Codex create a new `.prg` file from structured node and edge input.
- Let Codex modify text nodes and line edges without overwriting the original file by default.
- Keep the generated files compatible with Graphif 2.6.0-style project files.
- Provide JSON export for debugging and future integrations.
- Reserve a small AI adapter boundary for later Graphif AI/API integration without depending on it in v1.

## Non-Goals

- No live remote control of the Graphif desktop canvas in v1.
- No dependency on Graphif's AI configuration entry in v1.
- No attempt to reverse engineer private Graphif runtime behavior beyond the `.prg` file format required for safe file generation.
- No full clone of Graphif's editor UI.
- No automatic overwriting of user-provided source `.prg` files.

## Context

The user provided `C:/Users/Administrator/Desktop/123.prg` as a real Graphif sample. Inspection showed that a `.prg` file is a ZIP container with MessagePack payloads including:

- `stage.msgpack`
- `tags.msgpack`
- `reference.msgpack`
- `metadata.msgpack`
- `thumbnail.png`

The sample metadata contains version `2.6.0`. Its stage includes text nodes and line edges, where line edges reference node entries through path references such as `{"$": "/0"}` and `{"$": "/1"}`.

Graphif also has an AI configuration entry in the UI, but this only proves that Graphif can configure AI internally. It does not prove that external clients can call Graphif's canvas or AI runtime directly. Therefore the v1 design treats that as future integration context, not as a foundation.

## Architecture

The project will contain a `graphif-mcp` package.

Core modules:

- `src/server.ts`: MCP server entrypoint and tool registration.
- `src/prg/archive.ts`: ZIP read/write helpers for `.prg` containers.
- `src/prg/msgpack.ts`: MessagePack encode/decode boundary.
- `src/prg/stage.ts`: Graphif stage parsing, validation, and mutation helpers.
- `src/prg/builders.ts`: Text node and line edge builders.
- `src/prg/export.ts`: JSON export helpers.
- `src/aiAdapter/index.ts`: Reserved integration boundary with an empty v1 implementation.
- `tests/`: Unit and fixture tests.

Data flow:

1. Codex calls an MCP tool.
2. The MCP server resolves the requested path inside the current project.
3. The `.prg` archive is decoded into stage and metadata objects.
4. The requested mutation is applied to the decoded graph data.
5. The result is written to a new output `.prg` unless the tool explicitly receives an overwrite option.
6. The tool returns a concise result containing output path, changed graph summary, and warnings.

## MCP Tools

### `inspect_prg`

Input:

- `path`: Path to a `.prg` file.

Output:

- Graphif metadata version.
- Text nodes with stable IDs, UUIDs, text, and location.
- Line edges with UUIDs, source, target, text, and style.
- Warnings for unsupported stage entries.

### `export_json`

Input:

- `path`: Path to a `.prg` file.

Output:

- A JSON-safe graph representation for debugging and later conversion.

### `create_prg`

Input:

- `path`: Output `.prg` path.
- `nodes`: Text node definitions.
- `edges`: Line edge definitions.

Output:

- Created `.prg` path.
- Node and edge counts.

### `update_text_node`

Input:

- `path`: Source `.prg` path.
- `nodeId`: Preferred user-facing ID or UUID.
- `text`: New text.
- `outputPath`: Optional output path.

Output:

- Output `.prg` path.
- Updated node summary.

Default behavior writes a sibling file ending in `.generated.prg`.

### `add_text_node`

Input:

- `path`: Source `.prg` path.
- `id`: User-facing ID.
- `text`: Node text.
- `x`: X coordinate.
- `y`: Y coordinate.
- `outputPath`: Optional output path.

Output:

- Output `.prg` path.
- Created node summary.

### `add_line_edge`

Input:

- `path`: Source `.prg` path.
- `sourceId`: Source node ID or UUID.
- `targetId`: Target node ID or UUID.
- `text`: Optional edge label.
- `outputPath`: Optional output path.

Output:

- Output `.prg` path.
- Created edge summary.

## `.prg` Compatibility Strategy

The first implementation uses the provided `123.prg` structure as the compatibility baseline.

When creating a new file, the server will:

- Generate `metadata.msgpack` with version `2.6.0`.
- Generate `stage.msgpack` with `TextNode` and `LineEdge` entries.
- Preserve expected empty companion structures for tags and references.
- Include a generated fallback thumbnail or copied thumbnail only when required by Graphif compatibility testing.

When modifying an existing file, the server will:

- Preserve unknown archive entries.
- Preserve unsupported stage entries when possible.
- Only mutate supported `TextNode` and `LineEdge` objects.
- Keep existing UUIDs for unchanged objects.

## Safety

- Source files are not overwritten by default.
- Paths are resolved relative to the current project unless an explicit absolute path is allowed by a tool option.
- Bad archives, missing MessagePack files, or unsupported stage data return structured MCP errors.
- Mutation tools return warnings when they preserve unknown data.
- The server avoids destructive cleanup commands.

## AI Adapter Boundary

Graphif's visible AI configuration entry is not used in v1.

The project will include an `aiAdapter` module with a narrow interface reserved for future use:

- `isAvailable()`
- `describeCapabilities()`

In v1, these return that no direct Graphif AI bridge is configured. This prevents the first implementation from depending on uncertain Graphif internals while leaving a clear upgrade path.

## Testing

Required tests:

- Inspect the provided `123.prg` and detect the expected three text nodes and two line edges.
- Create a simple `1 -> 2 -> 3` `.prg`.
- Create and inspect Chinese text nodes.
- Export a `.prg` to JSON.
- Update a node without modifying the source file.
- Add a node and edge to an existing file.
- Return a friendly error for a missing file.
- Return a friendly error for a corrupted `.prg`.

Manual verification:

- Open a generated `.prg` in Graphif and confirm that nodes and edges display.

## Documentation

The project will include a README with:

- Project overview.
- Technology stack.
- MCP setup instructions.
- Tool reference.
- Development and test commands.
- Directory structure.
- Deployment/install notes for connecting Codex to the MCP server.

## Open Decisions

- Exact MCP SDK package selection will be confirmed during implementation planning.
- Whether to copy or generate `thumbnail.png` will be decided after Graphif compatibility testing.
- Whether absolute paths are allowed by default will be decided during implementation planning with a bias toward current-project paths.
