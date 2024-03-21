import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-deploy'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY || '0x'],
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY || '0x'],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_KEY || '',
      polygonMumbai: process.env.POLYGONSCAN_KEY || '',
    },
  },
  sourcify: {
    enabled: true,
  },
}

export default config
