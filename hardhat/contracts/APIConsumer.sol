// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice The Cryptocompare GET /data/pricemultifull API returns the current trading info (price, vol, open, high, low) 
 * of any list of cryptocurrencies in any other currency that you need. This consumer calls the API above and retrieve 
 * only the 24h ETH trading volume from the response.
 *
 * @dev THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract APIConsumer is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;

  uint256 public volume;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  event RequestVolume(bytes32 indexed requestId, uint256 volume);

  /**
   * @notice Initialize the link token and target oracle
   *
   * Network: Kovan
   * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
   * Oracle: 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656  (Chainlink Devrel Node)
   * Job ID: ca98366cc7314957b8c012c72f05aeeb
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
    jobId = "ca98366cc7314957b8c012c72f05aeeb";
    fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
  }

  /**
   * Create a Chainlink request to retrieve API response, find the target
   * data, then multiply by 1000000000000000000 (to remove decimal places from data).
   */
  function requestVolumeData() public returns (bytes32 requestId) {
    Chainlink.Request memory request = buildChainlinkRequest(
      jobId,
      address(this),
      this.fulfill.selector
    );

    // Set the URL to perform the GET request on
    request.add(
      "get",
      "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD"
    );

    // Set the path to find the desired data in the API response, where the response format is:
    // {"RAW":
    //   {"ETH":
    //    {"USD":
    //     {
    //      "VOLUME24HOUR": xxx.xxx,
    //     }
    //    }
    //   }
    //  }
    // request.add("path", "RAW.ETH.USD.VOLUME24HOUR"); // Chainlink nodes prior to 1.0.0 support this format
    request.add("path", "RAW,ETH,USD,VOLUME24HOUR"); // Chainlink nodes 1.0.0 and later support this format

    // Multiply the result by 1000000000000000000 to remove decimals
    int256 timesAmount = 10**18;
    request.addInt("times", timesAmount);

    // Sends the request
    return sendChainlinkRequest(request, fee);
  }

  /**
   * Receive the response in the form of uint256
   */
  function fulfill(bytes32 _requestId, uint256 _volume)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestVolume(_requestId, _volume);
    volume = _volume;
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
