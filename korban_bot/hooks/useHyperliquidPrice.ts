import { useEffect, useState } from 'react';

/**
 * Hyperliquid WebSocket Hook
 * Provides real-time price updates for a specific symbol.
 */
export function useHyperliquidPrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: "subscribe",
        subscription: { type: "l2Book", coin: symbol }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel === 'l2Book' && data.data) {
        const markPrice = parseFloat(data.data.levels[0][0].px);
        setPrice(markPrice);
      }
    };

    return () => ws.close();
  }, [symbol]);

  return price;
}
