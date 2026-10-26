
import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server";

const API_URL =
  process.env.OPENTERMINAL_API_URL ??
  "https://openterminal-rewq.onrender.com";

async function getMarketData(path: string): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Market API error: ${response.status}`);
  }

  return response.json();
}

const symbolSchema = fromJsonSchema<{ symbol: string }>({
  type: "object",
  properties: {
    symbol: {
      type: "string",
      pattern: "^[A-Za-z0-9.^-]{1,20}$"
    }
  },
  required: ["symbol"],
  additionalProperties: false
});

const emptySchema = fromJsonSchema<Record<string, never>>({
  type: "object",
  properties: {},
  additionalProperties: false
});

export function createMarketMcpServer() {
  const server = new McpServer({
    name: "openterminal-market-data",
    version: "1.0.0"
  });

  server.registerTool(
    "get_stock_quote",
    {
      description: "Get the latest available stock quote.",
      inputSchema: symbolSchema
    },
    async ({ symbol }) => ({
      content: [{
        type: "text",
        text: JSON.stringify(
          await getMarketData(
            `/api/quotes?symbols=${encodeURIComponent(symbol)}`
          )
        )
      }]
    })
  );

  server.registerTool(
    "get_stock_news",
    {
      description: "Get recent news about a stock.",
      inputSchema: symbolSchema
    },
    async ({ symbol }) => ({
      content: [{
        type: "text",
        text: JSON.stringify(
          await getMarketData(
            `/api/news?symbol=${encodeURIComponent(symbol)}`
          )
        )
      }]
    })
  );

  server.registerTool(
    "get_market_recap",
    {
      description: "Get the latest available market recap.",
      inputSchema: emptySchema
    },
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify(
          await getMarketData("/api/recap")
        )
      }]
    })
  );

  return server;
}
