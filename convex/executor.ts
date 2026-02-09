import { ethers } from 'ethers';
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Hyperliquid } from 'hyperliquid-sdk';

/**
 * Hyperliquid Order Execution Utility
 * Correctly uses the official 'hyperliquid-sdk' for L1 transactions.
 */
export const executeOrder = action({
  args: {
    symbol: v.string(),
    side: v.string(), // "BUY" or "SELL"
    size: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: any; error?: any }> => {
    const settings = await ctx.runQuery(api.trades.getSettings);
    const privateKey = settings?.activePrivateKey;

    if (!privateKey) {
      return { success: false, error: "Agent key missing. Please authorize in Dashboard." };
    }

    try {
      // 1. Initialize SDK with the private key (authorized via 'approveAgent' on L1)
      const wallet = new ethers.Wallet(privateKey);
      const sdk = new Hyperliquid(wallet); 

      const isBuy = args.side.toUpperCase() === "BUY";
      
      console.log(`[SDK_EXECUTOR] Placing ${args.side} order for ${args.size} ${args.symbol}`);

      // 2. Use official sdk.exchange method for reliable L1 execution
      // marketOpen handles asset conversion and L1 signature formatting
      const result = await sdk.custom.marketOpen(
        args.symbol,
        isBuy,
        args.size
      );

      if (result.status === 'ok') {
        console.log(`[SDK_EXECUTOR] Trade Confirmed on L1`);
        return { success: true, response: result.response };
      } else {
        return { success: false, error: result.response };
      }

    } catch (err: any) {
      console.error("[SDK_EXECUTOR] Error:", err.message);
      return { success: false, error: err.message };
    }
  },
});
