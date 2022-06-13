import Head from "next/head";
import Link from "next/link";
import React from "react";
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
            <a href="https://chain.link" target="_blank" rel="noreferrer">
              Chainlink
            </a>
          </div>
          <ul>
            <li>
              <Link href="./dataFeedConsumer">
                <a>Price Data Feed Consumer</a>
              </Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link href="./apiConsumer">
                <a>API Consumer</a>
              </Link>
            </li>
            <li>
              <Link href="./apiConsumerMultiWord">
                <a>API Consumer Multi-Word</a>
              </Link>
            </li>
            <li>
              <Link href="./apiConsumerArray">
                <a>API Consumer Array</a>
              </Link>
            </li>
            <li>
              <Link href="./apiConsumerLargeResponse">
                <a>API Consumer Large Response (IPFS)</a>
              </Link>
            </li>
            <li>
              <Link href="./apiConsumerPreConfiguredJob">
                <a>API Consumer Pre-configured Job</a>
              </Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link href="./sportsDataIOConsumer">
                <a>Sports Data IO Consumer</a>
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <img className={styles.image} src="./img/chainlink.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made by Fabiano Nascimento</footer>
    </div>
  );
}
