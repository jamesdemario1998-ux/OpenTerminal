
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const API_URL =
  process.env.OPENTERMINAL_API_URL ??
  "https://openterminal-rewq.onrender.com";

async function getMarketData(path: string) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Market API error: ${response.status}`);
  }

  return response.json();
}

export function createMarketMcpServer() {
  const server = new McpServer({
    name: "openterminal-market-data",
    version: "1.0.0",
  });

  server.registerTool(
    "get_stock_quote",
    {
      description: "Get current available stock price, volume, and company information.",
      inputSchema: z.object({
        symbol: z.string().regex(/^[A-Za-z0-9.^-]{1,20}$/),
      }),
    },
    async ({ symbol }) => {
      const data = await getMarketData(
        `/api/quotes?symbols=${encodeURIComponent(symbol)}`
      );

      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    }
  );

  server.registerTool(
    "get_stock_news",
    {
      description: "Retrieve recent news for a stock symbol.",
      inputSchema: z.object({
        symbol: z.string().regex(/^[A-Za-z0-9.^-]{1,20}$/),
      }),
    },
    async ({ symbol }) => {
      const data = await getMarketData(
        `/api/news?symbol=${encodeURIComponent(symbol)}`
      );

      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    }
  );

  server.registerTool(
    "get_market_recap",
    {
      description: "Get the latest available market recap, indexes, gainers, losers, and market news.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await getMarketData("/api/recap");

      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    }
  );

  return server;
}
