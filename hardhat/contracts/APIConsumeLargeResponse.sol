// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";


/**
 * @notice  IPFS is a decentralized file system for storing and accessing files, websites, applications, and data. For this example, 
 * we stored in IPFS a JSON file that contains arbitrary-length raw byte data. Call an API and fetch the response that is an
 * arbitrary-length raw byte data: https://ipfs.io/ipfs/QmZgsvrA1o1C8BGCrx6mHTqR1Ui1XqbCrtbMVrRLHtuPVD?filename=big-api-response.json 
 * 
 * @dev THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY. PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract APIConsumerLargeResponse is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  // variable bytes(arbitrary-length raw byte data) returned in a signle oracle response
  bytes public data;
  string public image_url;
  
  
  event RequestFulfilled(bytes32 indexed requestId, bytes indexed data);

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
    jobId = "7da2702f37fd48e5b1b9a5715e3509b6";
    fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
  }

    /**
     * @notice Request variable bytes from the oracle
     */
    function requestBytes() public {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillBytes.selector);
        req.add(
            'get',
            'https://ipfs.io/ipfs/QmZgsvrA1o1C8BGCrx6mHTqR1Ui1XqbCrtbMVrRLHtuPVD?filename=big-api-response.json'
        );
        req.add('path', 'image');
        sendChainlinkRequest(req, fee);
    }

    /**
     * @notice Fulfillment function for variable bytes
     * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
     */
    function fulfillBytes(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
        emit RequestFulfilled(requestId, bytesData);
        data = bytesData;
        image_url = string(data);
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
