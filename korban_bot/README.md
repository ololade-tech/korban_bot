# 🟠 KORBAN BOT | Institutional AI Trading Hub

Professional Smart Money Concepts (SMC) & ICT trading bot on Hyperliquid.

## 🤖 Telegram Bot Integration

To receive trade alerts and control the bot via Telegram:

1. **Get your Bot Token**: Message [@BotFather](https://t.me/botfather) on Telegram to create a new bot and copy the API Token.
2. **Get your Chat ID**: Message [@userinfobot](https://t.me/userinfobot) to get your unique numerical Chat ID.
3. **Set Convex Environment Variables**:
   - `TELEGRAM_BOT_TOKEN`: Your token from BotFather.
   - `TELEGRAM_CHAT_ID`: Your ID from userinfobot.

The bot will now automatically ping you whenever Kimi identifies a **High Confidence Setup**!

## 🚀 Quick Start (Deployment)

### 1. Backend (Convex)
```bash
cd korban_bot
npx convex deploy
```
*   Go to [Convex Dashboard](https://dashboard.convex.dev)
*   Set Environment Variables:
    *   `KIMI_API_KEY`: Your Moonshot/Kimi API key.
    *   `HL_PRIVATE_KEY`: Your Hyperliquid signing key (for auto-trading).

### 2. Frontend (Vercel)
*   Push this repo to GitHub.
*   Import to [Vercel](https://vercel.com).
*   Add Env Vars:
    *   `NEXT_PUBLIC_PRIVY_APP_ID`: From your Privy dashboard.
    *   `NEXT_PUBLIC_CONVEX_URL`: From your Convex dashboard.

## 🏛️ Architecture
- **Next.js 15**: Premium UI with Framer Motion & Tailwind.
- **Convex**: Real-time state management and AI orchestration.
- **Kimi API**: Institutional market analysis (SMC/ICT).
- **Hyperliquid SDK**: High-speed L1 execution.
- **Privy**: Secure embedded wallet infrastructure.

## 📈 Strategy
- **L2 Liquidity Clusters**
- **Fair Value Gaps (FVG)**
- **Market Structure Shifts (MSS)**
- **Order Block (OB) Validation**
