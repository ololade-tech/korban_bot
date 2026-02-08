import { ethers } from 'ethers';

/**
 * Professional Agent Wallet Flow
 * 1. Create a random "Trading Agent" key locally in the browser.
 * 2. Prompt user to sign 'approveAgent' via Privy/Metamask.
 * 3. Save only the Agent Key to Convex.
 */

export async function initializeAgent(userAddress: string, privySigner: any) {
  // 1. Generate a new, random agent wallet
  const agentWallet = ethers.Wallet.createRandom();
  
  // 2. Prepare the Hyperliquid 'approveAgent' action
  // This is the "Magic" that makes it seamless
  const action = {
    type: "approveAgent",
    hyperliquidChain: "Mainnet",
    signatureChainId: "0xa4b1", // Arbitrum
    agentAddress: agentWallet.address,
    agentName: "KorbanBotAgent",
    nonce: Date.now(),
  };

  // 3. User signs this ONCE via Privy
  // After this, the bot can trade 24/7 without asking again
  try {
    const signature = await privySigner.signTypedData(domain, types, action);
    
    // 4. Send the AGENT_PRIVATE_KEY to Convex safely
    // Now Convex can use this key to sign trades for you
    return {
      agentAddress: agentWallet.address,
      agentPrivateKey: agentWallet.privateKey,
      signature
    };
  } catch (err) {
    console.error("Agent Authorization Failed", err);
    throw err;
  }
}
