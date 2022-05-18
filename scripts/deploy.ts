const {ethers, hre} = require("hardhat");
require("dotenv").config({path: ".env"});
require("@nomiclabs/hardhat-etherscan");
const {DATA_FEED_ETH_USD, LINK_TOKEN} = require("../constants");

async function main() {
  const priceConsumer = await ethers.getContractFactory("PriceConsumer");
  // deploy the contract
  const deployedPriceConsumerContract = await priceConsumer.deploy(
    DATA_FEED_ETH_USD
  );

  await deployedPriceConsumerContract.deployed();

  // print the address of the deployed contract
  console.log(
    "Verify Contract Address:",
    deployedPriceConsumerContract.address
  );

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: deployedPriceConsumerContract.address,
    constructorArguments: [DATA_FEED_ETH_USD],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
