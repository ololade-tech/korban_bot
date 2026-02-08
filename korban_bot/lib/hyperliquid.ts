/**
 * Hyperliquid API Utility
 * Lightweight connector for fetching market data and account info.
 */

const HL_INFO_URL = "https://api.hyperliquid.xyz/info";

export async function getMarketData(symbol: string) {
  const response = await fetch(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
  });
  
  const data = await response.json();
  const meta = data[0].universe.find((u: any) => u.name === symbol);
  const context = data[1].find((c: any) => c.coin === symbol);
  
  return {
    symbol,
    markPrice: parseFloat(context?.markPx || "0"),
    dayVolume: parseFloat(context?.dayNtlVlm || "0"),
    funding: parseFloat(context?.funding || "0"),
  };
}

export async function getAccountInfo(address: string) {
  const response = await fetch(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "clearinghouseState", user: address }),
  });
  
  return await response.json();
}
