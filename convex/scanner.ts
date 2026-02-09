import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const marketScanner = action({
  args: {
    userAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check Balance First (Safety Logic)
    const resBalance = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clearinghouseState", user: args.userAddress }),
    });
    const accountState = await resBalance.json();
    const withrawalable = parseFloat(accountState.withdrawable || "0");

    // Get settings
    const settings = await ctx.runQuery(api.trades.getSettings);
    const threshold = settings?.minBalanceThreshold ?? 100;

    if (withrawalable < threshold) {
      console.log(`[SCANNER] Safety Stop: Balance $${withrawalable} below threshold $${threshold}`);
      return { status: "STOPPED", reason: "INSUFFICIENT_BALANCE" };
    }

    // 2. Fetch Multi-Market Data
    const resMeta = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
    });
    const marketData = await resMeta.json();
    
    // Filter for assets we care about (BTC, HYPE, ETH, etc.)
    const universe = marketData[0].universe;
    const contexts = marketData[1];
    
    // 3. Ask Kimi to pick the best market based on volatility and structure
    const scannerPrompt = `
      As Relogo Scanner, analyze these markets: ${JSON.stringify(contexts.slice(0, 10))}
      Current Balance: $${withrawalable}
      
      Identify which asset has the cleanest Institutional Order Block or Liquidity Sweep setup.
      Return JSON: { "best_pair": "SYMBOL", "reason": "why" }
    `;

    // (Kimi API call logic would go here to set the activeSymbol in settings)

    return { status: "SCANNING", balance: withrawalable, best_pair: "HYPE" };
  },
});
