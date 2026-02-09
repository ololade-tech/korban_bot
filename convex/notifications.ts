import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendAlert = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram config missing, skipping alert.");
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: args.message,
        parse_mode: "Markdown",
      }),
    });
  },
});
