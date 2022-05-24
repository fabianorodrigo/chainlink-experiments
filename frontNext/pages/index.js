import Head from "next/head";
import Link from "next/link";
import React, {useEffect, useRef, useState} from "react";
import Web3Modal from "web3modal";
import {
  abiConsumer,
  abiLink,
  CONSUMER_CONTRACT_ADDRESS,
  KOVAN_DEVREL_NODE,
  KOVAN_LINK_TOKEN,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
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
            It's a didatic project to learn about the blockchain oracle solution{" "}
            <a href="https://chain.link">Chainlink</a>
          </div>
          <div className={styles.description}>
            <Link href="./apiConsumer">
              <a {...props}>API Consumer</a>
            </Link>
            <Link href="./apiConsumerMultiWords">
              <a {...props}>API Consumer Multi-Word</a>
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
