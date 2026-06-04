import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: "../app/.env.server" });

/**
 * Hardhat config para deploy de AliviaActa en zkSYS Testnet.
 * Valores de la red: docs/specs/05-architecture.md §6 + CLAUDE.md.
 */

const PRIVATE_KEY = process.env.ALIVIA_VAULT_PRIVATE_KEY ?? "";
const RPC_URL = process.env.ZKSYS_RPC_URL ?? "https://rpc-test-zk.syscoin.org/";
const CHAIN_ID = parseInt(process.env.ZKSYS_CHAIN_ID ?? "5701", 10);
const EXPLORER_URL = process.env.ZKSYS_EXPLORER_URL ?? "https://explorer-test-zk.syscoin.org/";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    zksysTestnet: {
      url: RPC_URL,
      chainId: CHAIN_ID,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // El explorer de zkSYS Testnet no requiere API key real (placeholder OK)
    apiKey: { zksysTestnet: "placeholder" },
    customChains: [
      {
        network: "zksysTestnet",
        chainId: CHAIN_ID,
        urls: {
          apiURL: `${EXPLORER_URL.replace(/\/$/, "")}/api`,
          browserURL: EXPLORER_URL,
        },
      },
    ],
  },
};

export default config;
