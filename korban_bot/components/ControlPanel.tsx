'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from 'framer-motion';
import { ShieldAlert, Power, Wallet, Crosshair } from 'lucide-react';

export default function ControlPanel() {
  const settings = useQuery(api.trades.getSettings);
  const updateActiveMarket = useMutation(api.trades.updateActiveMarket);
  const toggleAutoTrade = useMutation(api.trades.toggleAutoTrading);

  if (!settings) return null;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Bot Controls</h2>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${settings.isAutoTrading ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {settings.isAutoTrading ? 'System Online' : 'System Paused'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Auto-Trade Toggle */}
        <button 
          onClick={toggleAutoTrade}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${settings.isAutoTrading ? 'bg-orange-500 border-orange-400 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-orange-500/50'}`}
        >
          <div className="flex items-center gap-3">
            <Power size={20} className={settings.isAutoTrading ? 'animate-pulse' : ''} />
            <span className="font-black uppercase tracking-tight text-sm">Autonomous Execution</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.isAutoTrading ? 'bg-black/20' : 'bg-zinc-800'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.isAutoTrading ? 'right-1' : 'left-1'}`} />
          </div>
        </button>

        {/* Safety Threshold */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Min. Balance Shield</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">${settings.minBalanceThreshold}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[40%]" />
          </div>
        </div>

        {/* Active Market Selector */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Crosshair size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Target Acquisition</span>
          </div>
          <div className="flex gap-2">
            {['HYPE', 'BTC', 'ETH', 'SOL', 'XAU'].map((sym) => (
              <button 
                key={sym}
                onClick={() => updateActiveMarket({ symbol: sym })}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${settings.activeSymbol === sym ? 'bg-white text-black' : 'bg-zinc-950 text-zinc-600 hover:text-white'}`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
