# 🟠 KORBAN BOT | Institutional AI Trading Hub

Professional Smart Money Concepts (SMC) & ICT trading bot on Hyperliquid.

## 🤖 Project Setup & Environment Variables

To get **Korban Bot** running in production (Convex + Vercel), you must configure the following environment variables.

### 1. Convex Backend (Neural Engine)
Set these in your [Convex Dashboard](https://dashboard.convex.dev) under **Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `KIMI_API_KEY` | Your Moonshot/Kimi API key (`sk-...`). |
| `HL_PRIVATE_KEY` | Your Hyperliquid Wallet Private Key (for signing trades). |
| `TELEGRAM_BOT_TOKEN` | (Optional) Token from [@BotFather](https://t.me/botfather) for alerts. |
| `TELEGRAM_CHAT_ID` | (Optional) Your Chat ID from [@userinfobot](https://t.me/userinfobot). |

### 2. Frontend (Next.js)
Set these in your **Vercel Dashboard** or `.env.local`:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Your App ID from the [Privy Dashboard](https://dashboard.privy.io). |
| `NEXT_PUBLIC_CONVEX_URL` | Your unique Convex Deployment URL (e.g., `https://...convex.cloud`). |

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

## 🏗️ Architecture
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
