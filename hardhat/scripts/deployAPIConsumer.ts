import {ethers, run} from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({path: ".env"});
require("@nomiclabs/hardhat-etherscan");

async function main() {
  const apiConsumer = await ethers.getContractFactory("APIConsumer");
  // deploy the contract
  const deployedAPIConsumerContract = await apiConsumer.deploy();

  await deployedAPIConsumerContract.deployed();
  console.log(
    "Deployed Contract Address:",
    deployedAPIConsumerContract.address
  );

  // print the address of the deployed contract
  //console.log("Verify Contract Address:", deployedAPIConsumerContract.address);

  // same problem as https://github.com/NomicFoundation/hardhat/issues/1349
  // console.log("Sleeping.....");
  // // Wait for etherscan to notice that the contract has been deployed
  // await sleep(60000);

  // // Verify the contract after deploying
  // await run("verify:verify", {
  //   address: deployedAPIConsumerContract.address,
  // });
}

function sleep(ms: number | undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
