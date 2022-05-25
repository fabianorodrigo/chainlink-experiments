import {Contract, providers} from "ethers";
import Head from "next/head";
import Link from "next/link";
import React, {useEffect, useRef, useState} from "react";
import Web3Modal from "web3modal";
import {
  abiConsumerArray,
  abiLink,
  CONSUMER_ARRAY_CONTRACT_ADDRESS,
  KOVAN_DEVREL_NODE,
  KOVAN_LINK_TOKEN,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // idFirstElement keeps track of the first element's ID in the array
  const [idFirstElement, setIdFirstElement] = useState("");
  // consumerLinkBalance keeps track of the consumer contract's balance in LINK
  const [consumerLinkBalance, setConsumerLinkBalance] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * updateFirstId: Triggers consumer contract to make a request for updated first ID to the oracle contract
   */
  const updateFirstId = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const consumerContract = new Contract(
        CONSUMER_ARRAY_CONTRACT_ADDRESS,
        abiConsumerArray,
        signer
      );
      // call the requestFirstId from the consumer contract, the consumer has to have LINK balance in order to request
      const tx = await consumerContract.requestFirstId();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert(
        "You successfully trigger the consumer contract to request first element ID!"
      );
    } catch (err) {
      console.error(err);
    }
  };

  /*
      connectWallet: Connects the MetaMask wallet
    */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const consumerContract = new Contract(
        CONSUMER_ARRAY_CONTRACT_ADDRESS,
        abiConsumerArray,
        provider
      );
      // call the owner function from the contract
      const _owner = await consumerContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  /**
   * @notice getFirstElementID: gets the first element's ID
   */
  const getFirstElementID = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const consumerContract = new Contract(
        CONSUMER_ARRAY_CONTRACT_ADDRESS,
        abiConsumerArray,
        provider
      );
      const F = 100000;
      // call the ID from the contract
      const _id = await consumerContract.id();
      setIdFirstElement(_id);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getConsumerLinkBalance: gets the consumer contract's LINK balance
   */
  const getConsumerLinkBalance = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const linkContract = new Contract(KOVAN_LINK_TOKEN, abiLink, provider);
      // call the balance from the contract
      const _balance = await linkContract.balanceOf(
        CONSUMER_ARRAY_CONTRACT_ADDRESS
      );
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setConsumerLinkBalance((_balance / 10 ** 18).toFixed(2));
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Kovan network, let them know and throw an error
    const {chainId} = await web3Provider.getNetwork();
    if (chainId !== 42) {
      window.alert("Change the network to Kovan");
      throw new Error("Change network to Kovan");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "kovan",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      getConsumerLinkBalance();
      getFirstElementID();

      // set an interval to get the Ether volume and the LINK balance of consumer every 5 seconds
      setInterval(async function () {
        await getFirstElementID();
        await getConsumerLinkBalance();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If the consumer contract has no LINK, it's not possible trigger the request
    if (consumerLinkBalance == 0) {
      return (
        <>
          <div className={styles.description}>
            The consumer contract has no LINK token. It's necessary to send it
            some in order to trigger an prices update request 🤷‍♂️
          </div>
          <div className={styles.description}>
            You can feed it with some LINK at{" "}
            <Link href="https://faucets.chain.link/">
              <a>Chainlink's faucet</a>
            </Link>{" "}
            . The consumer address is: {CONSUMER_ARRAY_CONTRACT_ADDRESS}.
          </div>
        </>
      );
    }

    // Triggers the consumer contract to make a request to Oracle
    return (
      <div>
        <div className={styles.description}>
          Trigger the consumer contract to request the ID of the first element
          returned by the API to the Chainlink DevRel Node, published at address{" "}
          {KOVAN_DEVREL_NODE}, and update the consumer's state #️
        </div>
        <button className={styles.button} onClick={updateFirstId}>
          Update ID ☝️
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Chainlink Experiments</title>
        <meta name="description" content="Chainlink Experiments" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Chainlink Experiments!</h1>
          <div className={styles.description}>
            <b>Summary:</b> The{" "}
            <a
              target="_blank"
              rel="noopener"
              href={`https://kovan.etherscan.io/address/${CONSUMER_ARRAY_CONTRACT_ADDRESS}`}
            >
              consumer contract
            </a>{" "}
            makes a request to the{" "}
            <a
              target="_blank"
              rel="noopener"
              href={`https://kovan.etherscan.io/address/${KOVAN_DEVREL_NODE}`}
            >
              oracle contract
            </a>{" "}
            which in turn calls the{" "}
            <a
              target="_blank"
              rel="noopener"
              href="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
            >
              Coingecko's API
            </a>{" "}
            to retrieve the ID of the first element in the array returned by the
            API.
          </div>
          <div className={styles.description}>
            <b>{consumerLinkBalance}</b> is the LINK balance of consumer
            contract.
          </div>
          <div className={styles.description}>
            <b>First ID:</b> {idFirstElement}
          </div>
          {renderButton()}
          <div>
            <Link href="/">
              <a>Back to home</a>
            </Link>
          </div>
        </div>
        <div>
          <img className={styles.image} src="./img/chainlink.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made by Fabiano Nascimento</footer>
    </div>
  );
}
