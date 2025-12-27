// Contract configuration constants
export const CONTRACT_CONFIG = {
  RPC_URL: "https://testnet.evm.nodes.onflow.org",
  CONTRACT_ADDRESS: "0x6D2c5578f9ab2D83855b85b19eA52Dd81967396c",
  RELAYER_PRIVATE_KEY:
    "cfd4c7154cd0cf56c94d1327812ccb5fa8b9d024b97d649b304eb92b3434ac42",
};

// Contract ABI for transferWithAuthorization function
export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "validAfter", type: "uint256" },
      { internalType: "uint256", name: "validBefore", type: "uint256" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Transaction payload structure for mesh network broadcasting
export interface TransactionPayload {
  type: "TRANSFER_WITH_AUTHORIZATION";
  contractAddress: string;
  functionName: string;
  parameters: {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
    signature: string;
  };
}
