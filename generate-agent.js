const { ethers } = require('ethers');

/**
 * RELOGO BOT: Agent Generator
 * This script creates a new, secure trading key for your bot.
 */

async function generate() {
    console.log("🟠 GENERATING RELOGO TRADING AGENT...");
    const wallet = ethers.Wallet.createRandom();
    
    console.log("\n--------------------------------------------------");
    console.log("1. AGENT ADDRESS (Public):", wallet.address);
    console.log("2. AGENT PRIVATE KEY (Secret):", wallet.privateKey);
    console.log("--------------------------------------------------\n");
    
    console.log("🚀 NEXT STEPS:");
    console.log("1. Copy the PRIVATE KEY into your Convex Environment Variables as 'HL_PRIVATE_KEY'.");
    console.log("2. Open Hyperliquid (app.hyperliquid.xyz).");
    console.log("3. Go to 'API' settings and 'Approve' the AGENT ADDRESS above.");
    console.log("4. Once approved, the bot has the 'Power of Attorney' to trade for you!");
}

generate();
