// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice  Coingecko GET /coins/markets/ API returns a list of coins and their market data such as price, market cap, and volume.
 * The objective is to fetch the id of the first element. 
 * 
 * @dev THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY. PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract APIConsumerArrayResponse is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  // First element's ID
  string public id;
  
  event RequestFirstId(bytes32 indexed requestId, string id);

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
    oracle = 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656;
    setChainlinkOracle(oracle);
    //
    jobId = "7d80a6386ef543a3abb52817f6707e3b";
    fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
  }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data which is located in a list
     */
    function requestFirstId() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        // API docs: https://www.coingecko.com/en/api/documentation?
        req.add('get', 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10');

        // Set the path to find the desired data in the API response, where the response format is:
        // [{
        //  "id": "bitcoin",
        //  "symbol": btc",
        // ...
        // },
        //{
        // ...
        // .. }]
        // request.add("path", "0.id"); // Chainlink nodes prior to 1.0.0 support this format
        req.add('path', '0,id'); // Chainlink nodes 1.0.0 and later support this format
        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the response in the form of string
     */
    function fulfill(bytes32 _requestId, string memory _id) public recordChainlinkFulfillment(_requestId) {
        emit RequestFirstId(_requestId, _id);
        id = _id;
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
