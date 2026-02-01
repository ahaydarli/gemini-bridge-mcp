#!/usr/bin/env node

// MCP server that connects Claude/IDEs to Gemini CLI
// Lets you run Gemini commands through the Model Context Protocol

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
    CallToolResult,
    TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";

// Types for the CLI options
type ApprovalMode = "default" | "auto_edit" | "yolo";
type OutputFormat = "text" | "json";
type GeminiModel =
    | "gemini-2.5-flash"
    | "gemini-2.5-pro"
    | "gemini-3-flash-preview"
    | "gemini-3-pro-preview";

interface GeminiExecuteParams {
    prompt: string;
    model?: GeminiModel;
    approvalMode?: ApprovalMode;
    outputFormat?: OutputFormat;
    sandbox?: boolean;
    workingDirectory?: string;
    includeDirectories?: string[];
    debug?: boolean;
}

// Escape special chars to prevent shell injection
function sanitizeInput(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`");
}

function createTextContent(text: string): TextContent {
    return { type: "text", text };
}

// Build the gemini CLI command from params
function buildCommand(params: GeminiExecuteParams): string {
    const {
        prompt,
        model = "gemini-3-pro-preview",
        approvalMode = "yolo",
        outputFormat = "text",
        sandbox = false,
        includeDirectories,
        debug = false,
    } = params;

    const parts: string[] = ["gemini"];

    // -p for headless/prompt mode
    parts.push(`-p "${sanitizeInput(prompt)}"`);

    if (model) {
        parts.push(`-m ${model}`);
    }

    parts.push(`--approval-mode ${approvalMode}`);

    if (outputFormat !== "text") {
        parts.push(`--output-format ${outputFormat}`);
    }

    if (sandbox) {
        parts.push("-s");
    }

    if (includeDirectories?.length) {
        const dirs = includeDirectories.map(d => sanitizeInput(d)).join(",");
        parts.push(`--include-directories ${dirs}`);
    }

    if (debug) {
        parts.push("-d");
    }

    return parts.join(" ");
}

// Set up the MCP server
const server = new Server(
    { name: "gemini-bridge-mcp", version: "0.0.1" },
    { capabilities: { tools: {} } }
);

// Tool schema - this is what MCP clients see
const geminiExecuteTool: Tool = {
    name: "gemini_execute",
    description:
        "Run tasks with Gemini CLI. Has full file system access and can run shell commands. Good for: creating files, refactoring, code analysis, running commands, etc.",
    inputSchema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "What you want Gemini to do. Be specific.",
            },
            model: {
                type: "string",
                description: "Which model to use",
                enum: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash-preview", "gemini-3-pro-preview"],
            },
            approvalMode: {
                type: "string",
                description: "How to handle tool approvals: 'default' = ask each time, 'auto_edit' = auto-approve edits, 'yolo' = approve everything",
                enum: ["default", "auto_edit", "yolo"],
                default: "yolo",
            },
            outputFormat: {
                type: "string",
                description: "Output as 'text' or 'json'",
                enum: ["text", "json"],
                default: "text",
            },
            sandbox: {
                type: "boolean",
                description: "Run in sandbox for extra safety",
                default: false,
            },
            workingDirectory: {
                type: "string",
                description: "Run from this directory",
            },
            includeDirectories: {
                type: "array",
                items: { type: "string" },
                description: "Extra directories to include (max 5)",
            },
            debug: {
                type: "boolean",
                description: "Show debug output",
                default: false,
            },
        },
        required: ["prompt"],
    },
};

// Return the tool list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [geminiExecuteTool],
}));

// Handle incoming tool calls
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;

    if (name !== "gemini_execute") {
        throw new Error(`Unknown tool: ${name}`);
    }

    const params = args as unknown as GeminiExecuteParams;

    // Basic validation
    if (!params.prompt?.trim()) {
        throw new Error("prompt is required");
    }

    if (params.includeDirectories && params.includeDirectories.length > 5) {
        throw new Error("max 5 directories allowed");
    }

    try {
        const command = buildCommand(params);

        const result = execSync(command, {
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024, // 10MB
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 600000, // 10 min
            cwd: params.workingDirectory || process.cwd(),
        });

        return {
            content: [createTextContent(result.trim() || "Done (no output)")],
        };
    } catch (error) {
        const err = error as { stderr?: string; message?: string };
        const msg = err.stderr || err.message || "Unknown error";

        // Try to give helpful hints
        let hint = "";
        if (msg.includes("command not found")) {
            hint = "\n\nInstall Gemini CLI: npm install -g @google/gemini-cli";
        } else if (msg.includes("auth")) {
            hint = "\n\nTry: gemini auth login";
        }

        return {
            content: [createTextContent(`Error: ${msg}${hint}`)],
            isError: true,
        };
    }
});

// Start it up
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Gemini Bridge MCP running");
}

main().catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
});
