import { ethers } from 'ethers';

/**
 * Hyperliquid Bridge Utility
 * Handles direct USDC deposits from Arbitrum to Hyperliquid L1.
 */

const BRIDGE_ADDRESS = "0x2df1c51e09a4dc133b976606a5e658e526e6374b";
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum Native USDC

const BRIDGE_ABI = [
  "function deposit(uint256 amount) external"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export async function depositToHyperliquid(amount: number, signer: any) {
    const usdcAmount = ethers.parseUnits(amount.toString(), 6);
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, signer);

    try {
        // 1. Check Allowance
        const userAddress = await signer.getAddress();
        const currentAllowance = await usdcContract.allowance(userAddress, BRIDGE_ADDRESS);
        
        if (currentAllowance < usdcAmount) {
            console.log("Approving USDC...");
            const approveTx = await usdcContract.approve(BRIDGE_ADDRESS, ethers.MaxUint256);
            await approveTx.wait();
        }

        // 2. Execute Deposit
        console.log(`Depositing ${amount} USDC to Hyperliquid L1...`);
        const depositTx = await bridgeContract.deposit(usdcAmount);
        return await depositTx.wait();
    } catch (err) {
        console.error("Deposit failed:", err);
        throw err;
    }
}
