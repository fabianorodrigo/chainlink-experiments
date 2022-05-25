// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice Using an existing Oracle Job makes your smart contract code more succinct. This contract retrieves the gas price from 
 * an existing Chainlink job that calls etherscan gas tracker API.
 *
 * The APIConsumer contract declares which URL to use, where to find the data in the response, and how to 
 * convert it so that it can be represented on-chain. In this contract, we use an existing job that is 
 * pre-configured to make requests to get the gas price. Using specialized jobs makes your contracts succinct and more simple.
 * 
 * Etherscan gas oracle returns the current Safe, Proposed and Fast gas prices:
 * https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=<API KEY>
 */
contract APIConsumerPreConfiguredJob is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;

    uint256 public gasPriceFast;
    uint256 public gasPriceAverage;
    uint256 public gasPriceSafe;

    bytes32 private jobId;
    uint256 private fee;

  event RequestGasPrice(
        bytes32 indexed requestId,
        uint256 gasPriceFast,
        uint256 gasPriceAverage,
        uint256 gasPriceSafe
    );

  /**
   * @notice Initialize the link token and target oracle
   *
   * Network: Kovan
   * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
   * Oracle: 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656  (Chainlink Devrel Node)
   * Job ID: 53f9755920cd451a8fe46f5087468395
   * Fee: 0.1 LINK
   */
  constructor() ConfirmedOwner(msg.sender) {
    // Sets the LINK token address for the detected public network
    // https://docs.chain.link/docs/chainlink-framework/
    //setPublicChainlinkToken();
    setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
    setChainlinkOracle(0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656);
    //
    jobId = "7223acbd01654282865b678924126013";
    fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
  }

    /**
     * @notice Create a Chainlink request the gas price from Etherscan
     */
    function requestGasPrice() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        // No need extra parameters for this job. Send the request
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the responses in the form of uint256
     */
    function fulfill(
        bytes32 _requestId,
        uint256 _gasPriceFast,
        uint256 _gasPriceAverage,
        uint256 _gasPriceSafe
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestGasPrice(_requestId, _gasPriceFast, _gasPriceAverage, _gasPriceSafe);
        gasPriceFast = _gasPriceFast;
        gasPriceAverage = _gasPriceAverage;
        gasPriceSafe = _gasPriceSafe;
    }

  /**
   * Allow withdraw of Link tokens from the contract
   */
  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(
      link.transfer(msg.sender, link.balanceOf(address(this))),
      "Unable to transfer"
    );
  }
}
