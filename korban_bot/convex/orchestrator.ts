import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const executeBrainTurn = action({
  args: {
    symbol: v.string(),
    userAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. SAFETY: Check Balance & Settings
    const settings = await ctx.runQuery(api.trades.getSettings);
    if (!settings?.isAutoTrading) return { status: "IDLE", reason: "Auto-trading is OFF" };

    const resBalance = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clearinghouseState", user: args.userAddress }),
    });
    const accountState = await resBalance.json();
    const balance = parseFloat(accountState.withdrawable || "0");

    if (balance < (settings.minBalanceThreshold ?? 100)) {
      return { status: "HALTED", reason: "Insufficient Balance" };
    }

    // 2. DATA: Fetch Candle & L2 Data
    const resCandles = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "candleSnapshot",
        req: { coin: args.symbol, interval: "15m", startTime: Date.now() - 2 * 3600 * 000 }
      })
    });
    const candles = await resCandles.json();

    const resL2 = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "l2Book", coin: args.symbol }),
    });
    const l2 = await resL2.json();

    // 3. BRAIN: Run Strategy Action
    const signal = await ctx.runAction(api.strategy.runProfessionalStrategy, {
      symbol: args.symbol,
      l2Data: l2,
      candleData: candles,
    });

    if (signal.action === "WAIT") {
      return { status: "MONITORING", reason: signal.reasoning };
    }

    // 4. EXECUTION: If Confidence is high, place order & notify
    if (signal.confidence > 0.85) {
      console.log(`[ORCHESTRATOR] Triggering ${signal.action} for ${args.symbol}`);
      
      await ctx.runAction(api.notifications.sendAlert, {
        message: `🚀 *KORBAN ALERT: ${signal.action} ${args.symbol}*\n\n` +
                 `🎯 *Setup*: ${signal.setup_type || 'Professional Logic'}\n` +
                 `🧠 *Reasoning*: ${signal.reasoning}\n` +
                 `💰 *TP*: ${signal.take_profit} | *SL*: ${signal.stop_loss}\n\n` +
                 `Confidence: ${(signal.confidence * 100).toFixed(0)}%`
      });

      // await ctx.runAction(api.executor.executeOrder, { ... });
    }

    return { status: "SIGNAL_GENERATED", action: signal.action };
  },
});
