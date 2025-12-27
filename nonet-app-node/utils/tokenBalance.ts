import { ethers } from "ethers";
import { CONTRACT_CONFIG } from "@/constants/contracts";

/**
 * Fetch MeshT ERC20 token balance for a given address
 * @param address - Wallet address to check balance for
 * @returns Formatted balance string with proper decimals
 */
export async function fetchMeshTBalance(address: string): Promise<string> {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL);

    // ERC-20 ABI for balanceOf, decimals, and symbol
    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];

    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_CONFIG.CONTRACT_ADDRESS,
      erc20Abi,
      provider
    );

    // Fetch balance and decimals in parallel
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);

    // Format balance with proper decimals
    const formattedBalance = ethers.formatUnits(balance, decimals);

    return formattedBalance;
  } catch (error) {
    console.error("❌ Error fetching MeshT balance:", error);
    throw error;
  }
}

/**
 * Get token symbol (MESHT)
 * @returns Token symbol string
 */
export async function getMeshTSymbol(): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL);
    const erc20Abi = ["function symbol() view returns (string)"];
    const contract = new ethers.Contract(
      CONTRACT_CONFIG.CONTRACT_ADDRESS,
      erc20Abi,
      provider
    );
    const symbol = await contract.symbol();
    return symbol;
  } catch (error) {
    console.error("❌ Error fetching token symbol:", error);
    // Return default if fetch fails
    return CONTRACT_CONFIG.TOKEN_NAME || "MESHT";
  }
}

