# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-02-02

### Added
- Initial release of Gemini Bridge MCP
- TypeScript implementation with full type safety
- MCP server bridge to Gemini CLI
- `gemini_execute` tool for file system and shell access
- Setup verification tool (`gemini-bridge-verify`)
- Comprehensive documentation and examples
- Input sanitization for secure command execution
- Support for Claude Desktop, VS Code, OpenCode, and other MCP clients

### Features
- Full file system read/write/edit capabilities via Gemini
- Shell command execution through Gemini CLI
- 10MB output buffer support
- 5-minute timeout for long-running operations
- Detailed error messages with troubleshooting hints
- Automated build process for npm publishing

### Developer Experience
- TypeScript with strict type checking
- Modern ESM module support
- Development mode with `tsx`
- Automated pre-publish build checks
- Clean project structure with `src/` and `dist/`

[0.0.1]: https://github.com/ahaydarli/gemini-bridge-mcp/releases/tag/v0.0.1
