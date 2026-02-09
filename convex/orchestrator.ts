import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const executeBrainTurn = action({
  args: {
    symbol: v.optional(v.string()),
    userAddress: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ status: string; reason?: string; action?: string }> => {
    // 1. SAFETY: Check Balance & Settings
    const settings = await ctx.runQuery(api.trades.getSettings);
    
    const symbol = args.symbol ?? settings?.activeSymbol ?? "HYPE";
    const userAddress = args.userAddress ?? settings?.activeWallet;

    if (!userAddress) {
      return { status: "HALTED", reason: "No active wallet authorized." };
    }

    const resBalance = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clearinghouseState", user: userAddress }),
    });
    const accountState = await resBalance.json();
    const balance = parseFloat(accountState.withdrawable || "0");

    // 2. DATA: Fetch Candle & L2 Data
    console.log(`[ORCHESTRATOR] Fetching data for ${symbol}...`);
    const resCandles = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "candleSnapshot",
        req: { coin: symbol, interval: "15m", startTime: Date.now() - 2 * 3600 * 1000 }
      })
    });
    const candles = await resCandles.json();

    const resL2 = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "l2Book", coin: symbol }),
    });
    const l2 = await resL2.json();

    // 3. BRAIN: Run Strategy Action
    console.log(`[ORCHESTRATOR] Analyzing ${symbol} with Mistral...`);
    const signal = (await ctx.runAction(api.strategy.runProfessionalStrategy, {
      symbol: symbol,
      l2Data: l2,
      candleData: candles,
    })) as {
      action: "BUY" | "SELL" | "WAIT";
      confidence: number;
      setup_type?: string;
      reasoning: string;
      take_profit?: string;
      stop_loss?: string;
    };

    console.log(`[ORCHESTRATOR] Signal generated: ${signal.action} (Confidence: ${signal.confidence})`);

    if (signal.action === "WAIT") {
      return { status: "MONITORING", reason: signal.reasoning };
    }

    // 4. EXECUTION: Only if Auto-Trading is ON and Balance is above threshold
    if (settings?.isAutoTrading && balance >= (settings.minBalanceThreshold ?? 0.1) && signal.confidence > 0.85) {
      console.log(`[ORCHESTRATOR] Triggering ${signal.action} execution for ${symbol}`);
      
      await ctx.runAction(api.notifications.sendAlert, {
        message: `🚀 *RELOGO ALERT: ${signal.action} ${symbol}*\n\n` +
                 `🎯 *Setup*: ${signal.setup_type || 'Professional Logic'}\n` +
                 `🧠 *Reasoning*: ${signal.reasoning}\n` +
                 `💰 *TP*: ${signal.take_profit} | *SL*: ${signal.stop_loss}\n\n` +
                 `Confidence: ${(signal.confidence * 100).toFixed(0)}%`
      });

      // await ctx.runAction(api.executor.executeOrder, { ... });
    } else if (signal.confidence > 0.85) {
      console.log(`[ORCHESTRATOR] Signal generated but execution skipped (Auto-trading: ${settings?.isAutoTrading}, Balance: ${balance})`);
    }

    return { status: "SIGNAL_GENERATED", action: signal.action };
  },
});
