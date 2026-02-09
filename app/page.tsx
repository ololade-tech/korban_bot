'use client';

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const { login, logout, authenticated, user } = usePrivy();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white selection:bg-orange-500/30">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-sans flex flex-col gap-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-4">
             <span className="text-4xl font-black text-black">R</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            RELOGO<span className="text-orange-500">BOT</span>
          </h1>
          <div className="h-1 w-12 bg-orange-500 rounded-full" />
        </motion.div>
        
        <p className="text-gray-500 text-center max-w-md text-lg font-medium leading-tight">
          Elite AI-Powered DEX Execution on <span className="text-orange-400">Hyperliquid</span>.
        </p>

        {!authenticated ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => login()}
            className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-black rounded-xl font-black transition-all shadow-[0_0_40px_rgba(249,115,22,0.2)]"
          >
            CONNECT WALLET
          </motion.button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="px-6 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 font-mono text-sm">
              CONNECTED: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
            </div>

            <div className="mt-4 p-8 border border-gray-800 rounded-[2rem] bg-zinc-900/30 backdrop-blur-3xl flex flex-col items-center gap-6 w-full min-w-[320px]">
               <Link 
                href="/dashboard"
                className="px-10 py-3 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 transition-colors"
               >
                 Open Dashboard
               </Link>
               <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
