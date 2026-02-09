'use client';

import { useHyperliquidPrice } from '@/hooks/useHyperliquidPrice';
import StatsDashboard from '@/components/StatsDashboard';
import { TradingChart } from '@/components/TradingChart';
import ControlPanel from '@/components/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ShieldCheck } from 'lucide-react';
import { initializeAgent } from '@/lib/agent-setup';

export default function Dashboard() {
  const { logout, user } = usePrivy();
  const [activeSymbol] = useState('HYPE');
  const price = useHyperliquidPrice(activeSymbol);
  
  const latestSignal = useQuery(api.trades.getLatestSignal, { symbol: activeSymbol });
  const saveAgentKey = useMutation(api.trades.saveAgentKey);
  const [chartData, setChartData] = useState<any[]>([]);

  // One-Click Authorization Flow
  const setupAgent = async () => {
    if (!user?.wallet?.address) return;
    
    try {
      // 1. Generate Agent & Request Signature from the connected wallet
      const agentData = await initializeAgent(user.wallet.address, (window as any).ethereum);
      
      // 2. Push the Agent's trading key to the bot backend
      await saveAgentKey({
        address: agentData.agentAddress,
        privateKey: agentData.agentPrivateKey
      });

      alert("SYSTEM INITIALIZED: Relogo AI is now authorized to trade on your behalf.");
    } catch (err) {
      console.error("Setup failed", err);
      alert("Authorization failed. Please ensure your wallet is connected.");
    }
  };

  // Fetch real candle data from Hyperliquid
  useEffect(() => {
    async function fetchCandles() {
      try {
        const res = await fetch("https://api.hyperliquid.xyz/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "candleSnapshot",
            req: { coin: activeSymbol, interval: "15m", startTime: Date.now() - 24 * 60 * 60 * 1000 }
          })
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((c: any) => ({
            time: (c.t / 1000) as any,
            open: parseFloat(c.o),
            high: parseFloat(c.h),
            low: parseFloat(c.l),
            close: parseFloat(c.c)
          })).sort((a: any, b: any) => a.time - b.time);
          setChartData(formatted);
        }
      } catch (e) {
        console.error("Candle fetch failed", e);
      }
    }
    fetchCandles();
    const interval = setInterval(fetchCandles, 60000);
    return () => clearInterval(interval);
  }, [activeSymbol]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black">R</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Relogo<span className="text-orange-500">Hub</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-orange-500">Neural Scanner Active</span>
             <div className="flex gap-4 items-center">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-zinc-600 uppercase font-black">Account Value</span>
                  <span className="text-sm font-mono font-bold text-white">$1,240.50</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-zinc-600 uppercase font-black">Active Market</span>
                  <span className="text-sm font-mono font-bold text-orange-500">{activeSymbol}</span>
                </div>
             </div>
          </div>
          <button 
            onClick={() => logout()}
            className="px-4 py-2 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors"
          >
            Exit
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsDashboard />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Live Market</h2>
              <div className="flex gap-2">
                {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
                  <button key={tf} className={`px-2 py-1 text-[10px] font-bold rounded ${tf === '15M' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <TradingChart data={chartData} />
            ) : (
              <div className="w-full h-[400px] bg-zinc-900/20 animate-pulse rounded-2xl border border-zinc-800 flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest text-xs">Loading Live Data...</div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <ControlPanel />
            
            <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-orange-500" size={20} />
                <h3 className="font-black uppercase tracking-widest text-sm text-white">Security: One-Click Agent</h3>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                To trade autonomously, Relogo creates a secure "Agent Wallet" inside your browser. This agent can ONLY trade—it has NO withdrawal permissions.
              </p>
              <button 
                onClick={() => setupAgent()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                Authorize Agent
              </button>
            </div>

            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mt-4">AI Intelligence</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex-1 min-h-[300px] overflow-y-auto">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Neural Engine Active</span>
               </div>
               
               <AnimatePresence mode="wait">
                 {latestSignal ? (
                   <motion.div 
                    key={latestSignal._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                   >
                     <div className="flex flex-col gap-4">
                        <div className={`px-4 py-2 rounded-xl font-black text-center text-black uppercase tracking-widest ${latestSignal.action === 'BUY' ? 'bg-green-500' : latestSignal.action === 'SELL' ? 'bg-red-500' : 'bg-orange-500'}`}>
                          {latestSignal.action} SIGNAL
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest px-1">
                          <span>{latestSignal.setup_type || 'Market Structure'}</span>
                          <span>Confidence: {(latestSignal.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col gap-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Institutional Reasoning</span>
                          <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                            {latestSignal.reasoning}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
                             <span className="text-[8px] font-bold text-zinc-500 uppercase">Stop Loss</span>
                             <span className="text-xs font-mono font-bold text-red-500">{latestSignal.stop_loss || 'N/A'}</span>
                           </div>
                           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
                             <span className="text-[8px] font-bold text-zinc-500 uppercase">Take Profit</span>
                             <span className="text-xs font-mono font-bold text-green-500">{latestSignal.take_profit || 'N/A'}</span>
                           </div>
                        </div>
                        <div className="text-[8px] font-bold text-zinc-600 text-center uppercase tracking-[0.3em] pt-2">
                           Verified {new Date(latestSignal.timestamp).toLocaleTimeString()}
                        </div>
                     </div>
                   </motion.div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-20">
                     <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Waiting for AI Signal...</p>
                   </div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
