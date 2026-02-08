'use client';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ label, value, subValue, icon, trend }: StatCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl backdrop-blur-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black text-white">{value}</span>
        {subValue && (
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-zinc-500'}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatsDashboard() {
  const stats = useQuery(api.trades.getStats);

  if (!stats) return <div className="h-32 w-full bg-zinc-900/20 animate-pulse rounded-3xl" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <StatCard 
        label="Win Rate" 
        value={`${stats.winRate.toFixed(1)}%`} 
        subValue={`${stats.count} trades total`}
        trend="neutral"
        icon={<Target size={18} />} 
      />
      <StatCard 
        label="Loss Rate" 
        value={`${stats.lossRate.toFixed(1)}%`} 
        subValue="Live calculation"
        trend="neutral"
        icon={<Activity size={18} />} 
      />
      <StatCard 
        label="Total PnL" 
        value={`$${stats.totalPnL.toFixed(2)}`} 
        subValue="Realized"
        trend={stats.totalPnL >= 0 ? 'up' : 'down'}
        icon={<TrendingUp size={18} />} 
      />
      <StatCard 
        label="Active Status" 
        value="LIVE" 
        subValue="Hyperliquid WS connected"
        trend="up"
        icon={<TrendingDown size={18} />} 
      />
    </div>
  );
}
