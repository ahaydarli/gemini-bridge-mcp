# Gemini Bridge MCP

[![npm version](https://img.shields.io/npm/v/gemini-bridge-mcp.svg)](https://www.npmjs.com/package/gemini-bridge-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that bridges Claude, VS Code, and other MCP clients to Google's Gemini CLI, enabling powerful AI-powered file system operations and shell command execution.

## Features

- 🔗 **Universal Bridge**: Connect any MCP client (Claude Desktop, VS Code, Claude Code) to Gemini CLI
- 📁 **File System Access**: Read, write, and edit files through Gemini
- 🖥️ **Shell Commands**: Execute complex shell operations via Gemini
- 🎯 **Model Selection**: Choose from Gemini 2.5 or 3 models
- 🔐 **Approval Modes**: Control permissions (default, auto_edit, yolo)
- 🧪 **Sandbox Mode**: Secure isolated execution
- 📂 **Multi-Directory**: Work across multiple project directories
- 🔒 **Type-Safe**: Built with TypeScript for reliability

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Gemini CLI** installed and configured

## Quick Start

### 1. Install Gemini CLI

```bash
npm install -g @google/gemini-cli
```

### 2. Login to Gemini

```bash
gemini auth login
```

### 3. Verify Setup

```bash
npx gemini-bridge-mcp verify
```

## Configuration

### Claude Code (VS Code Extension)

```bash
claude mcp add gemini-bridge -- npx -y gemini-bridge-mcp
```

### Claude Desktop

Edit your config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-bridge": {
      "command": "npx",
      "args": ["-y", "gemini-bridge-mcp"]
    }
  }
}
```

## Usage

After configuration, restart your MCP client. The `gemini_execute` tool will be available.

### Example Prompts

- "Use Gemini to create a new React component called UserProfile"
- "Ask Gemini to analyze this codebase and suggest improvements"
- "Have Gemini fix the TypeScript errors in src/utils.ts"

## Available Tools

### `gemini_execute`

Execute tasks using Gemini CLI with file system and shell access.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | **required** | The task or instruction for Gemini CLI |
| `model` | enum | `gemini-3-pro-preview` | Model: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3-flash-preview`, `gemini-3-pro-preview` |
| `approvalMode` | enum | `yolo` | Permissions: `default` (confirm all), `auto_edit` (auto-approve edits), `yolo` (auto-approve all) |
| `outputFormat` | enum | `text` | Output: `text` or `json` |
| `sandbox` | boolean | `false` | Run in sandboxed mode for isolation |
| `workingDirectory` | string | - | Execute from a specific directory |
| `includeDirectories` | array | - | Include additional directories (max 5) |
| `debug` | boolean | `false` | Enable verbose output |

### Example

```json
{
  "prompt": "Create a TypeScript function that validates email addresses",
  "model": "gemini-2.5-pro",
  "approvalMode": "yolo",
  "workingDirectory": "/path/to/project"
}
```

## Development

### Build from Source

```bash
git clone https://github.com/ahaydarli/gemini-bridge-mcp.git
cd gemini-bridge-mcp
npm install
npm run build
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run dev` | Run in dev mode with tsx |
| `npm run verify` | Check system requirements |
| `npm run typecheck` | Type check only |

## Troubleshooting

### "Gemini CLI not found"

```bash
npm install -g @google/gemini-cli
```

### "Authentication error"

```bash
gemini auth login
```

### "Command timeout"

The default timeout is 10 minutes. For longer tasks, break them into smaller operations.

## Security Considerations

- Gemini CLI has **full access** to your file system and can execute shell commands
- Default approval mode is `yolo` (auto-approve all) - use `default` for more control
- Use sandbox mode (`sandbox: true`) for untrusted operations
- Only use in trusted directories with trusted prompts

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [npm Package](https://www.npmjs.com/package/gemini-bridge-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Gemini CLI Docs](https://geminicli.com/docs/)