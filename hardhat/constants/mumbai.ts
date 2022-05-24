import {BigNumber} from "ethers";

// valores obtidos em: https://docs.chain.link/docs/vrf-contracts/v1
export const MUMBAI_LINK_TOKEN = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

// https://data.chain.link/polygon/mainnet/crypto-usd/eth-usd
// https://docs.chain.link/docs/matic-addresses/#Mumbai%20Testnet
export const MUMBAI_DATA_FEED_ETH_USD_ADDRESS =
  "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
// block where is the transaction of the data feed deploying
export const MUMBAI_DATA_FEED_ETH_USD_BLOCK_NUMBER = 3783684;

export const MUMBAI_VRF_COORDINATOR_ADDRESS =
  "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";

export const MUMBAI_VRF_SUBSCRIPTION_ID = BigNumber.from(272);
