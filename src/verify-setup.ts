#!/usr/bin/env node

import { execSync } from "child_process";

/**
 * Configuration for a system check
 */
interface CheckConfig {
    name: string;
    command: string;
    required: boolean;
    validate: (output: string) => string;
    failureHelp?: string;
}

/**
 * Execute a shell command and return the output
 */
function runCommand(command: string): string {
    try {
        return execSync(command, {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
        }).trim();
    } catch {
        throw new Error("Command failed");
    }
}

/**
 * System checks configuration
 */
const checks: CheckConfig[] = [
    {
        name: "Node.js version",
        command: "node --version",
        required: true,
        validate: (output: string): string => {
            const match = output.match(/v(\d+)/);
            if (!match) return "❌ FAIL (cannot parse version)";

            const version = parseInt(match[1] ?? "0", 10);
            return version >= 18
                ? `✅ OK (${output})`
                : `❌ FAIL (${output}, need v18+)`;
        },
    },
    {
        name: "npm installed",
        command: "npm --version",
        required: true,
        validate: (output: string): string => `✅ OK (v${output})`,
    },
    {
        name: "Gemini CLI installed",
        command: "gemini-cli --version",
        required: true,
        validate: (output: string): string => `✅ OK (${output})`,
        failureHelp: "Install with: npm install -g @gemini-api/cli",
    },
    {
        name: "Gemini API key configured",
        command: "gemini-cli config get apiKey",
        required: true,
        validate: (output: string): string => {
            return output && output.length > 10
                ? "✅ OK (API key found)"
                : "❌ Not configured";
        },
        failureHelp:
            "Configure with:\n  → gemini-cli config set apiKey YOUR_KEY\n  → Get key from: https://makersuite.google.com/app/apikey",
    },
];

/**
 * Run all system checks
 */
async function runChecks(): Promise<boolean> {
    console.log("🔍 Gemini Bridge MCP Server - Setup Verification\n");
    console.log("=".repeat(60));

    let allPassed = true;

    for (const check of checks) {
        try {
            const output = runCommand(check.command);
            const result = check.validate(output);

            console.log(`${check.name.padEnd(30)} ${result}`);

            if (result.includes("❌")) {
                allPassed = false;
                if (check.failureHelp) {
                    console.log(`  ${check.failureHelp.split("\n").join("\n  ")}`);
                }
            }
        } catch {
            console.log(`${check.name.padEnd(30)} ❌ NOT FOUND`);
            allPassed = false;

            if (check.failureHelp) {
                console.log(`  ${check.failureHelp.split("\n").join("\n  ")}`);
            }
        }
    }

    console.log("=".repeat(60));
    return allPassed;
}

/**
 * Display success or failure message
 */
function displayResults(allPassed: boolean): void {
    console.log("");

    if (allPassed) {
        console.log("✅ All checks passed! You're ready to use gemini-bridge-mcp");
        console.log("\n📋 Next steps:");
        console.log("  1. Configure in your MCP client (Claude Desktop, VS Code, etc.)");
        console.log("  2. Restart your MCP client");
        console.log("  3. Try: 'Use Gemini to create a test file'");
        console.log("\n📖 See README.md for configuration examples");
    } else {
        console.log("❌ Some checks failed. Please fix the issues above.");
        console.log("\n🔧 Quick fixes:");
        console.log("  • Install Gemini CLI: npm install -g @gemini-api/cli");
        console.log("  • Get API key: https://makersuite.google.com/app/apikey");
        console.log("  • Set API key: gemini-cli config set apiKey YOUR_KEY");
    }

    console.log("");
}

/**
 * Main function
 */
async function main(): Promise<void> {
    const allPassed = await runChecks();
    displayResults(allPassed);

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
}

// Run verification
main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
});
