# MCP Server - MyPostmanServer

A lightweight **Model Context Protocol (MCP)** server built with Node.js that exposes custom tools via HTTP/SSE for clients like Postman.

## Overview

This project implements an MCP server that communicates with external clients using **Server-Sent Events (SSE)** over HTTP. It demonstrates how to:
- Create and register custom tools
- Validate input parameters with Zod
- Establish bidirectional communication with MCP clients
- Handle tool invocations and return formatted responses

## Features

- **Custom Tools**: Defines a `greet` tool that clients can invoke
- **Type-Safe Validation**: Uses Zod for runtime parameter validation
- **SSE Transport**: Full-duplex communication over HTTP without WebSockets
- **Express Server**: Lightweight HTTP server for handling client connections

## Project Structure

```
.
├── index.js              # Main MCP server implementation
├── package.json          # Project dependencies and metadata
├── package-lock.json     # Dependency lock file
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Prerequisites

- **Node.js** 16+ (with ES module support)
- **npm** or **yarn** for package management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/gunjankum06/mcp.git
cd mcp
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Server

```bash
node index.js
```

You should see:
```
🚀 Server ready at http://localhost:3000/sse
```

### Connecting a Client

MCP clients (like Postman, Claude, or custom applications) can connect to the server:

1. **Initiate Connection**: Make a GET request to `http://localhost:3000/sse`
2. **Stream will open**: The server establishes a persistent SSE connection
3. **Call Tools**: Send requests to `http://localhost:3000/message` to invoke tools

### Available Tools

#### `greet`
Greets a person by name.

**Parameters:**
- `name` (string, required): The name of the person to greet

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Hello {name}! MCP is running on your laptop."
    }
  ]
}
```

**Example:**
```bash
POST http://localhost:3000/message
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "greet",
    "arguments": {
      "name": "John"
    }
  }
}
```

## Architecture

### Components

1. **MCP Server** (`McpServer`)
   - Core component that manages tool definitions and processing
   - Exposes tools to connected clients
   - Handles tool invocations

2. **SSE Transport** (`SSEServerTransport`)
   - Manages HTTP streaming connection with clients
   - Handles bidirectional message exchange
   - Routes `/message` callbacks back to the server

3. **Express API**
   - `/sse` (GET): Endpoint for client connection initialization
   - `/message` (POST): Endpoint for receiving client messages

### Communication Flow

```
Client                          Server
  |                               |
  |---- GET /sse ------->         |
  |                      Create SSE Transport
  |                      Connect MCP Server
  |<----- SSE Stream ----         |
  |                               |
  |---- POST /message ------>     |
  |  (tool call request)  Process Request
  |                               |
  |<----- Response -------        |
  |  (tool response)              |
```

## Dependencies

- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **express**: HTTP server framework
- **zod**: Schema validation library

## Configuration

The server is configured in [index.js](index.js) with:
- **Server Name**: `MyPostmanServer`
- **Server Version**: `1.0.0`
- **Port**: `3000`

To modify these, edit the corresponding values in the code.

## Error Handling

- Invalid tool parameters are caught by Zod schema validation
- Missing transport connections are handled gracefully in the `/message` route
- The server continues running even if individual tool calls fail

## Development

### Adding New Tools

To add a new tool, use the `server.tool()` method:

```javascript
server.tool(
  "toolName",
  { param1: z.string(), param2: z.number() },
  async ({ param1, param2 }) => ({
    content: [{ type: "text", text: `Result: ${param1} ${param2}` }]
  })
);
```

### Running in Development

For development with auto-reload, install `nodemon`:

```bash
npm install --save-dev nodemon
nodemon index.js
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the port number in [index.js](index.js):
```javascript
app.listen(YOUR_PORT, () => {
  console.log(`🚀 Server ready at http://localhost:YOUR_PORT/sse`);
});
```

### Client Connection Issues
- Ensure the server is running before connecting clients
- Check that the client is using the correct endpoint URL
- Verify that SSE is supported by your client

### Tool Not Found
- Ensure tools are registered before the server starts listening
- Check tool names match exactly (case-sensitive)
- Verify input parameters match the defined schema

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Express.js Documentation](https://expressjs.com)
- [Zod Documentation](https://zod.dev)

## License

MIT

## Author

**gunjankum06** - GitHub user
