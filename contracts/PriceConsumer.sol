// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";
contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Polygon Mumbai
     * Aggregator: ETH/USD
     * Address: 0x0715A7794a1dc8e42615F059dD6e406A6594651A
     */
    constructor(address _aggregatorAddress) {
        console.log("aggregator",_aggregatorAddress);
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        console.log("entrou");
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function teste() public view returns(string memory){
        return "bateu";
    }
}