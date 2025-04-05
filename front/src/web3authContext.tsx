// IMP START - Quick Start
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
// IMP END - Quick Start

// IMP START - Dashboard Registration
const clientId = "BLX1u7eg5WQHALfC243ma4RCqSlfKs0Nk8aOX5l28BgoXuOOGlCTp-5lg2tzTI4V0JsOQKqyNpCCQ65afeMmBJ4"; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// Get custom chain configs for your chain from https://web3auth.io/docs/connect-blockchain
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.OTHER,
  chainId: "0x3",
  // Avoid using public rpcTarget & wsTarget in production.
  // Use services like Infura
  rpcTarget: "https://devnet-ripple-node.tor.us",
  wsTarget: "wss://s.devnet.rippletest.net/",
  ticker: "XRP",
  tickerName: "XRPL",
  displayName: "xrpl devnet",
  blockExplorerUrl: "https://devnet.xrpl.org",
};
// IMP END - Chain Config

// IMP START - Instantiate SDK
const privateKeyProvider = new XrplPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3AuthOptions: Web3AuthOptions = {
  chainConfig,
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};
// IMP END - Instantiate SDK

// IMP START - Configuring External Wallets
// IMP END - Configuring External Wallets

// IMP START - Instantiate SDK
const web3AuthContextConfig = {
  web3AuthOptions,
};
// IMP END - Instantiate SDK

export default web3AuthContextConfig;
