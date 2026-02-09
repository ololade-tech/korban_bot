'use client';

import { useHyperliquidPrice } from '@/hooks/useHyperliquidPrice';
import StatsDashboard from '@/components/StatsDashboard';
import { TradingChart } from '@/components/TradingChart';
import ControlPanel from '@/components/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldCheck } from 'lucide-react';
import { initializeAgent } from '@/lib/agent-setup';
import { depositToHyperliquid } from '@/lib/bridge-utils';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { logout, user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [activeSymbol] = useState('HYPE');
  const [activeInterval, setActiveInterval] = useState('15m');
  const [balanceDetails, setBalanceDetails] = useState<{ accountValue: number, withdrawable: number } | null>(null);

  // Protection: Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const price = useHyperliquidPrice(activeSymbol);
  
  const latestSignal = useQuery(api.trades.getLatestSignal, { symbol: activeSymbol });
  const saveAgentKey = useMutation(api.trades.saveAgentKey);
  const ensureSettings = useMutation(api.trades.ensureSettings);
  const resetSettings = useMutation(api.trades.resetSettings);
  const triggerBrainTurn = useAction(api.orchestrator.executeBrainTurn);
  const [chartData, setChartData] = useState<any[]>([]);

  // Initialize settings if they don't exist
  useEffect(() => {
    if (authenticated) {
      ensureSettings();
    }
  }, [authenticated, ensureSettings]);

  // One-Click Authorization Flow
  const setupAgent = async () => {
    if (!user?.wallet?.address) return;
    
    try {
      const wallet = wallets.find(w => w.address.toLowerCase() === user.wallet?.address?.toLowerCase());
      if (!wallet) throw new Error("Wallet not found");

      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      const agentData = await initializeAgent(user.wallet.address, signer);
      
      await saveAgentKey({
        address: agentData.agentAddress,
        privateKey: agentData.agentPrivateKey
      });

      await triggerBrainTurn({ symbol: activeSymbol, userAddress: user.wallet.address });

      alert("SYSTEM INITIALIZED: Relogo AI is now authorized.");
    } catch (err) {
      console.error("Setup failed", err);
      alert("Authorization failed.");
    }
  };

  // Fetch real candle data from Hyperliquid
  useEffect(() => {
    async function fetchData() {
      try {
        const cRes = await fetch("https://api.hyperliquid.xyz/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "candleSnapshot",
            req: { coin: activeSymbol, interval: activeInterval, startTime: Date.now() - 48 * 60 * 60 * 1000 }
          })
        });
        const cData = await cRes.json();
        if (Array.isArray(cData)) {
          setChartData(cData.map((c: any) => ({
            time: (c.t / 1000) as any,
            open: parseFloat(c.o),
            high: parseFloat(c.h),
            low: parseFloat(c.l),
            close: parseFloat(c.c)
          })).sort((a: any, b: any) => a.time - b.time));
        }

        if (user?.wallet?.address) {
          const bRes = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "clearinghouseState", user: user.wallet.address })
          });
          const bData = await bRes.json();
          setBalanceDetails({
            accountValue: parseFloat(bData.marginSummary?.accountValue || "0"),
            withdrawable: parseFloat(bData.withdrawable || "0")
          });
        }
      } catch (e) {
        console.error("Fetch failed", e);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [activeSymbol, activeInterval, user?.wallet?.address]);

  if (!ready || !authenticated) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black">R</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Relogo<span className="text-orange-500">Hub</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 pr-6 border-r border-zinc-900 text-right">
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-orange-500 text-[8px]">Connected Wallet</span>
               <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-1 rounded">
                 {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
               </span>
             </div>
             <div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-orange-500 text-[8px]">Account Value</p>
               <p className={`text-sm font-mono font-bold ${balanceDetails?.accountValue === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                 ${balanceDetails?.accountValue.toFixed(2) ?? '0.00'}
               </p>
             </div>
             <div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-[8px]">Active Market</p>
               <p className="text-sm font-mono font-bold text-orange-500">{activeSymbol}</p>
             </div>
          </div>
          <button onClick={() => logout()} className="px-4 py-2 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors">Disconnect</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><StatsDashboard /></motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Live Market</h2>
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                  <button key={tf} onClick={() => setActiveInterval(tf)} className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-all ${activeInterval === tf ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>{tf}</button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? <TradingChart data={chartData} /> : <div className="w-full h-[400px] bg-zinc-900/20 animate-pulse rounded-2xl border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs font-black uppercase tracking-widest">Loading Market Data...</div>}
          </div>
          <div className="flex flex-col gap-4">
            <ControlPanel />
            <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center gap-2"><ShieldCheck className="text-orange-500" size={20} /><h3 className="font-black uppercase tracking-widest text-sm text-white">Authorize Agent</h3></div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">Required for 24/7 autonomous trading. Limited permissions: Trading only.</p>
              
              {balanceDetails?.accountValue === 0 && (
                <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-2xl flex flex-col gap-4">
                   <div>
                     <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Direct Deposit (Arbitrum)</p>
                     <p className="text-[8px] text-zinc-500 leading-tight">Send USDC directly from Arbitrum to your Hyperliquid L1 account.</p>
                   </div>
                   
                   <div className="flex gap-2">
                     <input 
                      type="number" 
                      id="depositAmount"
                      placeholder="Amount" 
                      className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono w-full focus:outline-none focus:border-orange-500 transition-colors"
                     />
                     <button 
                      onClick={async () => {
                        const amt = (document.getElementById('depositAmount') as HTMLInputElement).value;
                        if(!amt) return;
                        try {
                          const wallet = wallets.find(w => w.address.toLowerCase() === user?.wallet?.address?.toLowerCase());
                          if (!wallet) return;
                          const provider = await wallet.getEthereumProvider();
                          const ethersProvider = new ethers.BrowserProvider(provider);
                          const signer = await ethersProvider.getSigner();
                          await depositToHyperliquid(parseFloat(amt), signer);
                          alert("Deposit transaction submitted! Your balance will update in ~2-5 minutes.");
                        } catch (e) {
                          alert("Deposit failed. Check console for details.");
                        }
                      }}
                      className="px-4 py-2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all"
                     >
                       Deposit
                     </button>
                   </div>
                </div>
              )}

              <button onClick={() => setupAgent()} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-orange-500/20">Authorize System</button>
              <button onClick={() => resetSettings()} className="w-full py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors text-center">Reset Bot Settings</button>
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mt-4">AI Intelligence</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex-1 min-h-[300px] overflow-y-auto">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Neural Engine Active</span>
                 </div>
                 <button 
                  onClick={() => triggerBrainTurn({ symbol: activeSymbol })}
                  className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-500 uppercase hover:bg-orange-500 hover:text-black transition-all"
                 >
                   Refresh Analysis
                 </button>
               </div>
               <AnimatePresence mode="wait">
                 {latestSignal ? (
                   <motion.div key={latestSignal._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <div className="flex flex-col gap-4">
                        <div className={`px-4 py-2 rounded-xl font-black text-center text-black uppercase tracking-widest ${latestSignal.action === 'BUY' ? 'bg-green-500' : latestSignal.action === 'SELL' ? 'bg-red-500' : 'bg-orange-500'}`}>{latestSignal.action} SIGNAL</div>
                        <div className="flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest px-1"><span>{latestSignal.setup_type || 'Market Structure'}</span><span>Confidence: {(latestSignal.confidence * 100).toFixed(0)}%</span></div>
                        <div className="flex flex-col gap-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800"><span className="text-[10px] font-bold text-zinc-500 uppercase font-black">Reasoning</span><p className="text-sm text-zinc-300 leading-relaxed font-medium">{latestSignal.reasoning}</p></div>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center"><span className="text-[8px] font-bold text-zinc-500 uppercase">Stop Loss</span><span className="text-xs font-mono font-bold text-red-500">{latestSignal.stop_loss || 'N/A'}</span></div>
                           <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center"><span className="text-[8px] font-bold text-zinc-500 uppercase">Take Profit</span><span className="text-xs font-mono font-bold text-green-500">{latestSignal.take_profit || 'N/A'}</span></div>
                        </div>
                        <div className="text-[8px] font-bold text-zinc-600 text-center uppercase tracking-[0.3em] pt-2">Verified {new Date(latestSignal.timestamp).toLocaleTimeString()}</div>
                     </div>
                   </motion.div>
                 ) : <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-20"><p className="text-xs font-bold uppercase tracking-widest animate-pulse">Waiting for AI Signal...</p></div>}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
