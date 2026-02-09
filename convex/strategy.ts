/**
 * RELOGO STRATEGY ENGINE: Liquidity & Market Structure (LMS)
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
    const apiKey = process.env.MISTRAL_API_KEY;
    const apiUrl = "https://api.mistral.ai/v1/chat/completions";

    if (!apiKey) return { action: "WAIT", reasoning: "System not ready: Mistral key missing." };

    // PRO-LEVEL PROMPT: Smart Money Concepts (SMC) & ICT Focus
    const prompt = `
      You are an institutional-grade quant trader for Relogo Bot, specializing in Smart Money Concepts (SMC) and ICT methodology. 
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
      6. RESPONSE: Return ONLY a valid JSON object. No Markdown. No commentary.

      RESPONSE FORMAT:
      {
        "action": "BUY" | "SELL" | "WAIT",
        "confidence": 0.0 to 1.0,
        "setup_type": "string",
        "entry_zone": "string",
        "stop_loss": "string",
        "take_profit": "string",
        "reasoning": "string"
      }
    `;

    console.log(`[STRATEGY] Requesting Mistral analysis for ${args.symbol}...`);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[STRATEGY] Mistral API Error: ${response.status} - ${errorText}`);
      return { action: "WAIT", reasoning: "Neural Engine temporarily unavailable." };
    }

    const data = await response.json();
    console.log(`[STRATEGY] Mistral response received.`);
    const strategyResult = JSON.parse(data.choices[0].message.content);

    // Save for Dashboard visibility
    await ctx.runMutation(api.trades.recordSignal, {
      symbol: args.symbol,
      action: strategyResult.action,
      reasoning: strategyResult.reasoning,
      confidence: strategyResult.confidence,
      setup_type: strategyResult.setup_type,
      stop_loss: strategyResult.stop_loss,
      take_profit: strategyResult.take_profit,
    });

    return strategyResult;
  },
});
