// MCP server for exposing tools via HTTP/SSE
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// SSE transport for bidirectional communication
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// HTTP server framework
import express from "express";
// Runtime validation library
import { z } from "zod";


// Create MCP server instance
const server = new McpServer({
  name: "MyPostmanServer",
  version: "1.0.0"
});

// Register "greet" tool
server.tool(
  "greet",
  { name: z.string().describe("Name to greet") },
  async ({ name }) => ({
    content: [{ type: "text", text: `Hello ${name}! MCP is running on your laptop.` }]
  })
);


// Express server
const app = express();
let transport; // SSE connection to client

// GET /sse - Establish SSE connection
app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

// POST /message - Handle client messages
app.post("/message", async (req, res) => {
  if (transport) await transport.handlePostMessage(req, res);
});

// Start server on port 3000
app.listen(3000, () => {
  console.log("🚀 Server ready at http://localhost:3000/sse");
});