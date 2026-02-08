import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getKimiSignal = action({
  args: {
    symbol: v.string(),
    priceData: v.string(), // Stringified candle/market data
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.KIMI_API_KEY;
    const apiUrl = "https://api.moonshot.cn/v1/chat/completions";

    if (!apiKey) {
      console.error("KIMI_API_KEY is not set");
      return { action: "WAIT", reasoning: "Kimi API key missing" };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: "You are an elite Hyperliquid crypto trading expert. Analyze the provided market data and return a JSON response with 'action' (BUY/SELL/WAIT), 'confidence' (0-1), and 'reasoning'. Focus on trend following and liquidity clusters.",
          },
          {
            role: "user",
            content: `Analyze this data for ${args.symbol}: ${args.priceData}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Save the signal to the database for the UI to display
    await ctx.runMutation(api.trades.recordSignal, {
      symbol: args.symbol,
      action: result.action,
      reasoning: result.reasoning,
      confidence: result.confidence,
    });

    return result;
  },
});
