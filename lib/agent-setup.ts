import { ethers } from 'ethers';

/**
 * Professional Agent Wallet Flow (Hyperliquid L1 Compatible)
 * 1. Create a random "Trading Agent" key locally in the browser.
 * 2. Prompt user to sign 'ApproveAgent' via EIP-712.
 * 3. Return signature for backend authorization.
 */

export async function initializeAgent(userAddress: string, signer: any) {
  // 1. Generate a new, random agent wallet
  const agentWallet = ethers.Wallet.createRandom();
  const nonce = Date.now();
  
  // 2. Define the exact Hyperliquid EIP-712 structure for Mainnet
  // Ref: Hyperliquid L1 Docs & SDK
  const domain = {
    name: "HyperliquidSignTransaction",
    version: "1",
    chainId: 42161, // Hyperliquid Mainnet User Signing Chain
    verifyingContract: "0x0000000000000000000000000000000000000000",
  };

  const types = {
    "HyperliquidTransaction:ApproveAgent": [
      { name: "hyperliquidChain", type: "string" },
      { name: "agentAddress", type: "address" },
      { name: "agentName", type: "string" },
      { name: "nonce", type: "uint64" },
    ],
  };

  const message = {
    hyperliquidChain: "Mainnet",
    agentAddress: agentWallet.address,
    agentName: "RelogoBotAgent",
    nonce: nonce,
  };

  try {
    // 3. Request Signature using ethers.js Signer
    // We specify the primaryType explicitly to match Hyperliquid's expectation
    const signature = await signer.signTypedData(domain, types, message);
    
    return {
      agentAddress: agentWallet.address,
      agentPrivateKey: agentWallet.privateKey,
      signature,
      nonce
    };
  } catch (err) {
    console.error("Hyperliquid Agent Signature Failed:", err);
    throw err;
  }
}
