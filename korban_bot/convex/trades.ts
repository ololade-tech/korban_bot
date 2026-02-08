import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current Win/Loss stats calculated from closed trades
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const closedTrades = await ctx.db
      .query("trades")
      .withIndex("by_status", (q) => q.eq("status", "CLOSED"))
      .collect();

    if (closedTrades.length === 0) {
      return { winRate: 0, lossRate: 0, totalPnL: 0, count: 0 };
    }

    const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length;
    const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);

    return {
      winRate: (wins / closedTrades.length) * 100,
      lossRate: ((closedTrades.length - wins) / closedTrades.length) * 100,
      totalPnL,
      count: closedTrades.length,
    };
  },
});

/**
 * Record a new signal from the AI
 */
export const recordSignal = mutation({
  args: {
    symbol: v.string(),
    action: v.string(),
    reasoning: v.string(),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("signals", {
      ...args,
      processed: false,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get the latest signal for a symbol
 */
export const getLatestSignal = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .order("desc")
      .first();
  },
});

/**
 * Get the current bot settings
 */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

/**
 * Update the active symbol the bot is focused on
 */
export const updateActiveMarket = mutation({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, { activeSymbol: args.symbol });
    }
  },
});

/**
 * Toggle the auto-trading status
 */
export const toggleAutoTrading = mutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, { isAutoTrading: !settings.isAutoTrading });
    }
  },
});

/**
 * Initial setup for settings if they don't exist
 */
export const initSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (!existing) {
      await ctx.db.insert("settings", {
        isAutoTrading: false,
        maxLeverage: 3,
        stopLossPercent: 2,
        takeProfitPercent: 6,
        minBalanceThreshold: 100,
        allowedSymbols: ["HYPE", "BTC", "ETH", "SOL", "XAU"],
        activeSymbol: "HYPE",
      });
    }
  },
});
