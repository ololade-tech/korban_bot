import { ethers } from 'ethers';
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Hyperliquid } from 'hyperliquid-sdk';

/**
 * Hyperliquid Order Execution Utility
 * Uses the Hyperliquid SDK to sign and place orders on L1 via an authorized Agent.
 */
export const executeOrder = action({
  args: {
    symbol: v.string(),
    side: v.string(), // "BUY" or "SELL"
    size: v.number(),
    isMarket: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the Trading Agent's Private Key from Settings
    const settings = await ctx.runQuery(api.trades.getSettings);
    const privateKey = settings?.activePrivateKey;

    if (!privateKey) {
      console.error("[EXECUTOR] No trading agent key found in settings.");
      return { success: false, error: "Trading agent not authorized. Please click 'Authorize Agent' in the dashboard." };
    }

    try {
      // 2. Initialize Hyperliquid SDK with the Agent Wallet
      const wallet = new ethers.Wallet(privateKey);
      const sdk = new Hyperliquid(wallet, false); // Mainnet

      const isBuy = args.side.toUpperCase() === "BUY";
      
      console.log(`[EXECUTOR] Attempting ${args.side} ${args.size} ${args.symbol} on Hyperliquid L1...`);

      // 3. Place Market Order (Hyperliquid uses Limit IOC @ price 0 for market-like execution)
      // Custom marketOpen handles slippage and lot sizes internally
      const result = await sdk.custom.marketOpen(
        args.symbol,
        isBuy,
        args.size
      );

      if (result.status === 'ok') {
        console.log(`[EXECUTOR] Order SUCCESS:`, result.response);
        
        // Log the successful trade in the database
        await ctx.runMutation(api.trades.logTrade, {
          symbol: args.symbol,
          side: args.side.toLowerCase(),
          entryPrice: 0, // Market price at the time
          amount: args.size,
          status: "OPEN",
          openedAt: Date.now()
        });

        return { success: true, response: result.response };
      } else {
        console.error(`[EXECUTOR] Order FAILED:`, result.response);
        return { success: false, error: result.response };
      }

    } catch (err: any) {
      console.error("[EXECUTOR] Execution error:", err.message);
      return { success: false, error: err.message };
    }
  },
});
