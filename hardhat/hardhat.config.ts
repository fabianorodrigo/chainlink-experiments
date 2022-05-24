import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import "hardhat-gas-reporter";
import {HardhatUserConfig} from "hardhat/config";

dotenv.config();

// RINKEBY API KEY
const RINKEBY_ALCHEMY_API_KEY_URL = process.env.RINKEBY_ALCHEMY_API_KEY_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY as string;
// KOVAN API KEY
const KOVAN_INFURA_API_KEY_URL = process.env.KOVAN_INFURA_API_KEY_URL;
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY as string;

validateEV(
  "INFURA_KOVAN_API_KEY_URL",
  KOVAN_INFURA_API_KEY_URL,
  "https://kovan.infura.io/v3/<KEY>"
);
// ETHERSCAN API KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
validateEV("ETHERSCAN_API_KEY", ETHERSCAN_API_KEY);

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      forking: {
        url: KOVAN_INFURA_API_KEY_URL as string,
        // Hardhat Network will by default fork from the latest mainnet block.
        // While this might be practical depending on the context, to set up a test
        // suite that depends on forking we recommend forking from a specific block number.
        //blockNumber: DATA_FEED_ETH_USD_BLOCK_NUMBER,
      },
    },
    rinkeby: {
      url: RINKEBY_ALCHEMY_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    kovan: {
      url: KOVAN_INFURA_API_KEY_URL,
      accounts: [KOVAN_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;

function validateEV(name: string, value: string | undefined, example?: string) {
  if (value == null || value.trim() == "") {
    let msg = `Environment variable '${name}' `;
    if (example) {
      msg += `to '${example} `;
    }
    msg += `is required`;
    throw new Error(msg);
  }
}
