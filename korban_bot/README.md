# 🟠 KORBAN BOT | Institutional AI Trading Hub

Professional Smart Money Concepts (SMC) & ICT trading bot on Hyperliquid.

## 🤖 Project Setup & Environment Variables

To get **Korban Bot** running in production (Convex + Vercel), you must configure the following environment variables.

### 1. Convex Backend (Neural Engine)
Set these in your [Convex Dashboard](https://dashboard.convex.dev) under **Settings > Environment Variables**:

| Variable | Description | Source Link |
| :--- | :--- | :--- |
| `KIMI_API_KEY` | Your Moonshot/Kimi API key. | [Moonshot API Platform](https://platform.moonshot.cn/) |
| `HL_PRIVATE_KEY` | Your Hyperliquid **Agent** Private Key. | [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets) |
| `TELEGRAM_BOT_TOKEN` | Bot API Token for alerts. | [@BotFather](https://t.me/botfather) |
| `TELEGRAM_CHAT_ID` | Your unique numerical Chat ID. | [@userinfobot](https://t.me/userinfobot) |

### 2. Frontend (Next.js)
Set these in your **Vercel Dashboard** or `.env.local`:

| Variable | Description | Source Link |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Your unique Privy App ID. | [Privy Dashboard](https://dashboard.privy.io/) |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex Deployment URL. | [Convex Dashboard](https://dashboard.convex.dev) |

## 🚀 Deployment Steps

1. **Deploy the Brain**:
   ```bash
   cd korban_bot
   npx convex deploy
   ```

2. **Connect the Hub**:
   - Push this code to your GitHub.
   - Link the repository to [Vercel](https://vercel.com).
   - Add the Frontend environment variables listed above.

3. **Activate the Scanner**:
   - Once deployed, the `convex/crons.ts` will start the 15-minute market heartbeat automatically.

## 📈 Strategy
- **L2 Liquidity Clusters**
- **Fair Value Gaps (FVG)**
- **Market Structure Shifts (MSS)**
- **Order Block (OB) Validation**
