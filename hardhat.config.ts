import * as dotenv from "dotenv";

import {HardhatUserConfig} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import {DATA_FEED_ETH_USD_BLOCK_NUMBER} from "./constants";

dotenv.config();

// POLYGON MAINNET API KEY
const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
if (ALCHEMY_API_KEY_URL == null || ALCHEMY_API_KEY_URL.trim() == "") {
  throw new Error(
    `Environment variable 'ALCHEMY_API_KEY_URL' to 'https://polygon-mumbai.g.alchemy.com/v2/<KEY>' is required`
  );
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url: ALCHEMY_API_KEY_URL as string,
        // Hardhat Network will by default fork from the latest mainnet block.
        // While this might be practical depending on the context, to set up a test
        // suite that depends on forking we recommend forking from a specific block number.
        //blockNumber: DATA_FEED_ETH_USD_BLOCK_NUMBER,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
