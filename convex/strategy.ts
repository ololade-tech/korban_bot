/**
 * KORBAN STRATEGY ENGINE: Liquidity & Market Structure (LMS)
 * 
 * This strategy focuses on:
 * 1. Market Structure Breaks (MSB)
 * 2. Liquidity Clusters (Orderbook Depth)
 * 3. Fair Value Gaps (FVG) / Imbalances
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const runProfessionalStrategy = action({
  args: {
    symbol: v.string(),
    l2Data: v.any(), // Orderbook data
    candleData: v.any(), // Recent OHLCV
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.KIMI_API_KEY;
    const apiUrl = "https://api.moonshot.cn/v1/chat/completions";

    if (!apiKey) return { action: "WAIT", reasoning: "System not ready: Neural key missing." };

    // PRO-LEVEL PROMPT: Smart Money Concepts (SMC) & ICT Focus
    const prompt = `
      You are an institutional-grade quant trader for Korban Bot, specializing in Smart Money Concepts (SMC) and ICT methodology. 
      Analyze the following data for ${args.symbol} with extreme precision.
      
      MARKET DATA:
      - CANDLES (15m OHLCV): ${JSON.stringify(args.candleData.slice(-15))}
      - L2 BOOK (Liquidity & Order Blocks): ${JSON.stringify(args.l2Data)}
      
      STRATEGY GUIDELINES (SMC/ICT):
      1. LIQUIDITY VOIDS & FVG: Identify gaps where price was delivered inefficiently.
      2. ORDER BLOCKS (OB): Locate high-volume areas where "Smart Money" has entered. Look for the last bearish candle before a bullish move (for Buyside OB) or vice-versa.
      3. MARKET STRUCTURE SHIFT (MSS): Look for the displacement that breaks the previous swing high/low.
      4. TREND LINES & LIQUIDITY SWEEPS: Spot where retail trend lines are being "swept" to fuel the next big move.
      5. PREMIUM vs DISCOUNT: Are we in a high-probability zone (e.g., below 50% retracement for a long)?

      RESPONSE FORMAT (Strict JSON):
      {
        "action": "BUY" | "SELL" | "WAIT",
        "confidence": 0.0 to 1.0,
        "setup_type": "Order Block Rejection" | "FVG Fill" | "Liquidity Sweep" | "MSS Confirmation",
        "entry_zone": "price",
        "stop_loss": "price",
        "take_profit": "price",
        "reasoning": "SMC-focused institutional analysis"
      }
    `;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const strategyResult = JSON.parse(data.choices[0].message.content);

    // Save for Dashboard visibility
    await ctx.runMutation(api.trades.recordSignal, {
      symbol: args.symbol,
      action: strategyResult.action,
      reasoning: `${strategyResult.reasoning} | SL: ${strategyResult.stop_loss} | TP: ${strategyResult.take_profit}`,
      confidence: strategyResult.confidence,
    });

    return strategyResult;
  },
});
