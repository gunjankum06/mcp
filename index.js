// Import the MCP Server class - core component for running a Model Context Protocol server
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import the SSE (Server-Sent Events) transport layer for streaming communication with clients
// SSE allows the server to push data to clients without WebSockets
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Import Express - a lightweight web framework for Node.js to handle HTTP routes
import express from "express";

// Import Zod - a TypeScript-first schema validation library for runtime type checking
import { z } from "zod";


// Initialize and configure the MCP Server
// This server will expose tools/capabilities to external clients like Postman
const server = new McpServer({
  name: "MyPostmanServer",  // Display name for the server (identifies it to clients)
  version: "1.0.0"           // Version string for tracking server evolution
});

// ============================================
// TOOL DEFINITION: "greet"
// ============================================
// Register a custom tool called "greet" that external clients can invoke
// This tool demonstrates how to expose a function via the MCP protocol
server.tool(
  "greet",  // Tool name that clients will reference when calling this function
  /*
   * Schema definition using Zod for input validation
   * Defines what parameters the tool accepts and their types
   * name: a required string parameter with a helpful description
   */
  { name: z.string().describe("Name to greet") }, 
  /*
   * Async handler function that executes when a client calls this tool
   * Destructures the validated { name } parameter from the request
   * Returns an object with formatted content for the client
   */
  async ({ name }) => ({
    content: [{ type: "text", text: `Hello ${name}! MCP is running on your laptop.` }]
  })
);


// ============================================
// EXPRESS SERVER SETUP
// ============================================
// Create an Express application instance for handling HTTP requests
const app = express();

// Variable to store the SSE transport connection
// This maintains the persistent connection to the client
let transport;

// ============================================
// ROUTE 1: /sse (GET)
// ============================================
// This endpoint establishes the SSE (Server-Sent Events) connection
// Clients initiate connection here to receive server-to-client messages
app.get("/sse", async (req, res) => {
  // Create a new SSE transport instance
  // Parameter 1: "/message" - the route where clients will send replies back to the server
  // Parameter 2: res - Express response object to stream events to the client
  transport = new SSEServerTransport("/message", res);
  
  // Connect the MCP server to this transport
  // This enables the server to send tool definitions and responses to the client
  // The connection remains open for bidirectional communication
  await server.connect(transport);
});

// ============================================
// ROUTE 2: /message (POST)
// ============================================
// This endpoint receives incoming messages from the client
// Used for tool calls, responses, and other client-to-server communication
app.post("/message", async (req, res) => {
  // If a transport connection exists, process the incoming message
  // The transport layer handles parsing the request and routing to appropriate handlers
  if (transport) await transport.handlePostMessage(req, res);
});

// ============================================
// SERVER STARTUP
// ============================================
// Start the Express server and listen for incoming connections
app.listen(3000, () => {
  // Display confirmation that the server is running
  // Clients should connect to http://localhost:3000/sse to initiate a session
  console.log("🚀 Server ready at http://localhost:3000/sse");
});