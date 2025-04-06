"use client";

import { getXrplChainConfig, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { IProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import XrplRPC from "@/xrplRPC";
import { Logo } from "@/components/Logo";
import MapPage from "./map/page";

const uiConsole = (...args: any) => {
  console.log(...args);
};

export default function Home() {
  return <MapPage />;
}
