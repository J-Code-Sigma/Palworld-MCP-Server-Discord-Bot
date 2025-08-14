# Palworld MCP Server & Discord Bot

This project allows you to run and manage your Palworld server scripts via Discord or any MCP client. It supports:

- Running any `.sh` script in a specified directory
- Listing available scripts dynamically
- (Optional) Using a local Ollama AI model for advice or automation

---

## 1. Prerequisites

- Ubuntu 22.04 server with your Palworld server installed
- Node.js and npm
- Discord account and server where you can add a bot
- (Optional) Ollama installed locally

Install Node.js if not already installed:

```
sudo apt update
sudo apt install nodejs npm -y
```

---

## 2. Discord Bot Setup

1. Go to Discord Developer Portal: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new Application and add a Bot
3. Copy the Bot Token
4. Under OAuth2 -> URL Generator:
   - Scope: `bot`
   - Permissions: `Send Messages`, `Read Messages`
   - Use the generated URL to invite the bot to your server
5. Note your Discord User ID to restrict commands to yourself

---

## 3. MCP Server Setup

```
mkdir ~/palworld-mcp
cd ~/palworld-mcp
npm init -y
npm install @modelcontextprotocol/server
```

Create `server.js`:

```
import { Server } from "@modelcontextprotocol/server";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

const SCRIPTS_DIR = "/home/steam";

function getAvailableScripts() {
    return fs.readdirSync(SCRIPTS_DIR)
        .filter(file => file.endsWith(".sh"))
        .map(file => path.basename(file));
}

function runScript(scriptName) {
    return new Promise((resolve) => {
        const scriptPath = path.join(SCRIPTS_DIR, scriptName);
        if (!fs.existsSync(scriptPath) || !scriptPath.startsWith(SCRIPTS_DIR)) {
            resolve(`Script not found or not allowed: ${scriptName}`);
            return;
        }
        execFile("bash", [scriptPath], { cwd: SCRIPTS_DIR }, (error, stdout, stderr) => {
            if (error) { resolve(`Error: ${error.message}`); return; }
            if (stderr) { resolve(`stderr: ${stderr}`); return; }
            resolve(stdout);
        });
    });
}

const server = new Server({
    name: "palworld-script-runner",
    version: "1.0.0",
    tools: {
        list_scripts: {
            description: "Lists all available .sh scripts",
            parameters: {},
            execute: async () => {
                const scripts = getAvailableScripts();
                return { content: [{ type: "text", text: scripts.join("\n") }] };
            }
        },
        run_script: {
            description: "Runs a specific .sh script",
            parameters: {
                scriptName: { type: "string", description: "The script file to run" }
            },
            execute: async ({ scriptName }) => {
                const output = await runScript(scriptName);
                return { content: [{ type: "text", text: output }] };
            }
        }
    }
});

server.listen();
console.log(`MCP Server running — watching ${SCRIPTS_DIR}`);
```

Run server:

```
node server.js
```

---

## 4. Discord Bot Setup

```
mkdir ~/palworld-discord
cd ~/palworld-discord
npm init -y
npm install discord.js node-fetch
```

Create `bot.js`:

```
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const TOKEN = "YOUR_DISCORD_BOT_TOKEN";
const ALLOWED_USER_IDS = ["YOUR_DISCORD_USER_ID"];
const MCP_SERVER_URL = "http://localhost:3000/tools";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

async function callMCPTool(toolName, params = {}) {
    const res = await fetch(`${MCP_SERVER_URL}/${toolName}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    const data = await res.json();
    return data?.content?.[0]?.text || "No output.";
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!ALLOWED_USER_IDS.includes(message.author.id)) return;

    if (message.content.toLowerCase().startsWith("!listscripts")) {
        const output = await callMCPTool("list_scripts");
        await message.channel.send(`\`\`\`${output.substring(0, 1900)}\`\`\``);
    }

    if (message.content.toLowerCase().startsWith("!runscript")) {
        const parts = message.content.split(" ");
        if (parts.length < 2) return message.channel.send("Usage: !runscript <scriptname>");
        const scriptName = parts[1];
        const output = await callMCPTool("run_script", { scriptName });
        await message.channel.send(`\`\`\`${output.substring(0, 1900)}\`\`\``);
    }
});

client.login(TOKEN);
```

Run bot:

```
node bot.js
```

or

```
nohup node bot.js &
```

---

## 5. Optional: Ollama Integration

Install Ollama:

```
curl -fsSL https://ollama.com/install.sh | sh
```

Pull a model:

```
ollama pull llama3
```

Example MCP tool:

```
ask_ollama: {
    description: "Ask the local AI model",
    parameters: { prompt: { type: "string" } },
    execute: async ({ prompt }) => {
        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3', prompt })
        });
        const data = await res.json();
        return { content: [{ type: "text", text: data.output_text }] };
    }
}
```

Discord command:

```
!askai "How do I fix Palworld crash logs?"
```

---

## 6. Usage

**Discord Commands**

```
!listscripts         → List all .sh scripts in /home/steam
!runscript update.sh → Run a specific script
!runscript restart.sh → Restart server via script
!askai <prompt>      → Ask local Ollama AI (optional)
```

**MCP Tools**

```
list_scripts → Returns available scripts
run_script   → Runs a specific script
ask_ollama   → (Optional) Queries local AI model
```

---

## 7. Notes & Security

- MCP server only runs scripts inside `/home/steam`
- Restrict Discord bot commands to your user ID
- Make scripts executable:

```
chmod +x /home/steam/*.sh
```

- Ollama runs locally — no external API calls required

