import {expect, assert} from "chai";
import {Wallet} from "ethers";
import {ethers, waffle} from "hardhat";
import {DATA_FEED_ETH_USD_ADDRESS} from "../constants";
import {PriceConsumerV3, PriceConsumerV3__factory} from "../typechain-types";

describe("Price Consumer", function () {
  let accounts: Wallet[] = [];
  let PriceConsumer: PriceConsumerV3__factory;
  let contract: PriceConsumerV3;

  before(async () => {
    accounts = await waffle.provider.getWallets();
    PriceConsumer = await ethers.getContractFactory("PriceConsumerV3");
  });

  this.beforeEach(async () => {
    // está dando erro pois este endereço é o endereço na Mumbai
    // na blockchain local não tem esse contrato, muito menos neste endereço
    contract = await PriceConsumer.deploy(DATA_FEED_ETH_USD_ADDRESS);
    await contract.deployed();
    console.log(contract.address);
  });

  it("Should get ETH price in USD", async function () {
    assert.isNotNull(contract);
    const price = await contract.getLatestPrice();
    expect(price).to.be.greaterThan(0);
    console.log(price);
  });

  it("Should return 'bateu'", async function () {
    assert.isNotNull(contract);
    expect(await contract.teste()).to.be.equal("bateu");
  });
});
