import { Contract, ethers, providers } from 'ethers';
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Web3Modal from 'web3modal';
import {
  abiConsumerSportsDataIO,
  abiLink,
  CONSUMER_SPORTSDATAIO_ADDRESSS,
  KOVAN_LINK_TOKEN,
  KOVAN_SPORTS_DATAIO_ORACLE_ADDRESS,
} from '../constants';
import styles from '../styles/Home.module.css';

//TODO: monitorar o evento GameDuplicated
// fazer testes unitários fazendo forking da Kovan

export default function SportsDataIOConsumer() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // date used on the request for
  const [dateGame, setDateGame] = useState(
    new Date().toISOString().slice(0, 10)
  );
  // gameList
  const [gameList, setGameList] = useState({});
  // const [gasPriceAverage, setGasPriceAverage] = useState("0");
  // const [gasPriceSafe, setGasPriceSafe] = useState("0");

  // consumerLinkBalance keeps track of the consumer contract's balance in LINK
  const [consumerLinkBalance, setConsumerLinkBalance] = useState('0');
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * updateGamesCreated: Triggers consumer contract to request the tournament games on a specific date
   */
  const updateGamesCreated = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const consumerContract = new Contract(
        CONSUMER_SPORTSDATAIO_ADDRESSS,
        abiConsumerSportsDataIO,
        signer
      );
      const dateTarget = getUNIXTimeStamp(dateGame);
      console.log('dateTarget', new Date(dateTarget * 1000).toISOString());
      // call the requestGamesByDate from the consumer contract, the consumer has to have LINK balance in order to request
      const tx = await consumerContract.requestGamesByDate(
        consumerContract.LEAGUE_ID_MLB(),
        dateTarget
      );
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert(
        'You successfully trigger the consumer contract to request Ether prices!'
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * @param {string} dtISO date in ISO format YYYY-MM-DD
   * @returns {number} today's date as a UNIX timestamp in seconds
   */
  const getUNIXTimeStamp = (dtISO) => {
    const dt = new Date(dtISO);
    return (
      Date.UTC(
        dt.getUTCFullYear(),
        dt.getUTCMonth(),
        dt.getUTCDate(),
        dt.getUTCHours(),
        dt.getUTCMinutes(),
        dt.getUTCSeconds()
      ) / 1000
    );
  };

  /**
   * updateScores: Triggers consumer contract to request the tournament games scores
   */
  const updateScores = async (selectedGames) => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const consumerContract = new Contract(
        CONSUMER_SPORTSDATAIO_ADDRESSS,
        abiConsumerSportsDataIO,
        signer
      );
      // call the requestScoreByGamesId from the consumer contract, the consumer has to have LINK balance in order to request
      const tx = await consumerContract.requestScoreByGamesId(
        consumerContract.LEAGUE_ID_MLB(),
        getUNIXTimeStamp(dateGame),
        selectedGames.map((game) => game.gameId)
      );
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert(
        'You successfully trigger the consumer contract to request Ether prices!'
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
   * Converts the hexadecimal representation of a string in the string format
   *
   * @param {string} hexIn Hexadecimal representation of a string
   * @returns string represented
   */
  const hex2Str = (hexIn) => {
    const hex = ethers.utils.hexStripZeros(hexIn);
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
      const charCode = parseInt(hex.substring(n, n + 2), 16);
      if (!isNaN(charCode)) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  };

  /**
   * getGameCreateMlb: gets the first game registred in the consumer contract
   */
  const getGameCreateMlb = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const consumerContract = new Contract(
        CONSUMER_SPORTSDATAIO_ADDRESSS,
        abiConsumerSportsDataIO,
        provider
      );

      // When the page loads, search for RequestGame among the last 10.000 blocks
      const currentBlock = await provider.getBlockNumber();
      //console.log("currentBlock", currentBlock);
      const filter = consumerContract.filters.GameFound();
      const events = await consumerContract.queryFilter(
        filter,
        currentBlock - 100000
      );
      // GAMEDUPLICATED
      const filterDuplicated = consumerContract.filters.GameDuplicated();
      const eventsDuplicated = await consumerContract.queryFilter(
        filterDuplicated,
        currentBlock - 100000
      );
      // FULFILLMENT
      const filterFulfill = consumerContract.filters.Fulfillment();
      const eventsFulFill = await consumerContract.queryFilter(
        filterFulfill,
        currentBlock - 100000
      );
      console.log('found', events);
      console.log('duplicados', eventsDuplicated);
      console.log(
        'fulfill',
        eventsFulFill.map((event) => event.args)
      );

      if (events.length == 0) {
        console.log(
          `No events since block ${
            currentBlock - 100000
          }. Current block: ${currentBlock}`
        );
      }

      //for each event, extract games' data
      for (const event of events) {
        const games = gameList;
        extractGameDataFromEvent(event, games);
        setGameList({ ...games });
      }

      //Keep monitoring events RequestGame. For each event caught, insert into the list
      consumerContract.on(filter, async (gameId, game, event) => {
        console.warn(`evento GameFound aí pô`, event);
        const games = gameList;
        extractGameDataFromEvent(event, games);
        setGameList({ ...games });
      });
      consumerContract.on(
        filterFulfill,
        async (requestId, result, datetime, length, event) => {
          console.warn(
            `evento Fulfill aí pô`,
            event.args.requestId,
            new Date(event.args.datetime * 1000).toISOString(),
            `length: ${event.args.size.toString()}`,
            length
          );
        }
      );
      consumerContract.on(filterDuplicated, async (gameId, game, event) => {
        console.warn(`evento Duplicated aí pô`, event.args.gameId, game);
      });

      // // call the gas price average from the contract
      // const _average = await consumerContract.getGameCreateMlb();
      // setGasPriceAverage(_average.toString());
      // // call the gas price fast from the contract
      // const _fast = await consumerContract.gasPriceFast();
      // setGameList(_fast.toString());
      // // call the gas price safe from the contract
      // const _safe = await consumerContract.gasPriceSafe();
      // setGasPriceSafe(_safe.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   *
   * @param {Event} event reference to a SportsConsumer.GameFound event
   * @param {object} games object where the game found in event will be loaded
   * @returns List of games reported within the event
   */
  const extractGameDataFromEvent = async (event, target) => {
    //TODO: try to extract information from the event with JS bitwise operators
    const g = event.args.game;
    target[g.gameId] = {
      gameId: g.gameId,
      homeTeam: hex2Str(g.homeTeam),
      awayTeam: hex2Str(g.awayTeam),
      startTime: g.startTime,
      homeScore: g.homeScore,
      awayScore: g.awayScore,
      status: hex2Str(g.status),
      selected: false,
    };
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
        CONSUMER_SPORTSDATAIO_ADDRESSS
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
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 42) {
      const msg = 'Change the network to Kovan';
      console.log(msg);
      window.alert(msg);
      throw new Error(msg);
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
        network: 'kovan',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      getConsumerLinkBalance();
      getGameCreateMlb();

      // set an interval to get the Ether volume and the LINK balance of consumer every 5 seconds
      // setInterval(async function () {
      //   //await getGameCreateMlb();
      //   await getConsumerLinkBalance();
      // }, 5 * 1000);
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

    //If the consumer contract has no LINK, it's not possible trigger the request
    if (consumerLinkBalance == 0) {
      return (
        <>
          <div className={styles.description}>
            The consumer contract has no LINK token. It's necessary to send it
            some in order to trigger an prices update request 🤷‍♂️
          </div>
          <div className={styles.description}>
            You can feed it with some LINK at{' '}
            <Link href="https://faucets.chain.link/">
              <a>Chainlink's faucet</a>
            </Link>{' '}
            . The consumer address is: {CONSUMER_SPORTSDATAIO_ADDRESSS}.
          </div>
        </>
      );
    }

    // Triggers the consumer contract to make a request to Oracle
    return (
      <div>
        <div className={styles.description}>
          <input
            type="date"
            value={dateGame}
            onChange={(e) => setDateGame(e.target.value)}
          />
        </div>
        <button className={styles.button} onClick={updateGamesCreated}>
          Update Games ⚾
        </button>
      </div>
    );
  };

  /**
   * renderUpdateScoreButton
   * @returns button to update score of selected games
   */
  const renderUpdateScoreButton = () => {
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

    const selectedGames = Object.values(gameList).filter((g) => g.selected);
    return (
      <div>
        <button
          className={styles.button}
          onClick={() => updateScores(selectedGames)}
          disabled={selectedGames.length == 0}
        >
          Update Scores 🏆
        </button>
      </div>
    );
  };

  if (!walletConnected) {
    return null;
  }

  if (typeof window === 'undefined') {
    console.log('lixo');
    return <></>;
  } else {
    return (
      <>
        <div>
          <Head>
            <title>Chainlink Experiments</title>
            <meta name="description" content="Chainlink Experiments" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className={styles.main}>
            <div>
              <h1 className={styles.title}>
                Welcome to Chainlink Experiments!
              </h1>
              <div className={styles.description}>
                <b>Summary:</b> The{' '}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://kovan.etherscan.io/address/${CONSUMER_SPORTSDATAIO_ADDRESSS}`}
                >
                  consumer contract
                </a>{' '}
                makes a request to the oracle contract,{' '}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://kovan.etherscan.io/address/${KOVAN_SPORTS_DATAIO_ORACLE_ADDRESS}`}
                >
                  Chainlink's data provider Sports Data IO
                </a>
                , in order to request data about games of MLB.
              </div>
              <div className={styles.description}>
                <b>{consumerLinkBalance}</b> is the LINK balance of consumer
                contract.
              </div>
              <div className={styles.subTitle}>Games</div>

              <table border="0" cellPadding={5} cellSpacing={0}>
                <thead>
                  <tr>
                    <th></th>
                    <th colSpan={2}>Home</th>
                    <th></th>
                    <th colSpan={2}>Away</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(gameList)
                    .sort((a, b) => (a.startTime > b.startTime ? 1 : -1))
                    .map((g) => {
                      return (
                        <tr key={g.gameId}>
                          <td>
                            <input
                              type="checkbox"
                              name="selectedGame"
                              checked={g.selected}
                              onChange={(e) => {
                                setGameList({
                                  ...gameList,
                                  [g.gameId]: {
                                    ...g,
                                    selected: e.target.checked,
                                  },
                                });
                              }}
                            />
                            [{g.gameId}]
                          </td>
                          <td>{g.homeTeam}</td>
                          <td>{g.homeScore}</td>
                          <td>X</td>
                          <td>{g.awayScore}</td>
                          <td>{g.awayTeam}</td>
                          <td>
                            {new Date(g.startTime * 1000).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(g.startTime * 1000).toLocaleTimeString()}
                          </td>
                          <td>{g.status}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className={styles.prices}></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                {renderButton()}
                {renderUpdateScoreButton()}
              </div>
              <div></div>
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
        </div>
        <footer className={styles.footer}>Made by Fabiano Nascimento</footer>
      </>
    );
  }
}
