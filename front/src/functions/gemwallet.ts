import { isInstalled, getAddress } from "@gemwallet/api";
import { NFTokenCreateOffer, NFTokenAcceptOffer } from "xrpl";
import * as xrpl from "xrpl";
import { submitTransaction } from "@gemwallet/api";

const apiBase = "http://localhost:8080";

export interface NFTData {
  gps: string;
  surface: number;
  ref_cad: string;
  price: string;
  address: string;
}

export const connectGemWallet = async () => {
  try {
    const installed = await isInstalled();
    if (!installed.result.isInstalled) {
      alert("GemWallet n'est pas installé !");
      return;
    }
    console.log("GemWallet est installé");

    const { result } = await getAddress();
    if (!result?.address) {
      alert("Connexion à GemWallet échouée");
      return;
    }

    console.log("🎉 Connecté avec l'adresse :", result.address);

    return result.address;
  } catch (error) {
    console.error("Erreur lors de la connexion à GemWallet :", error);
    alert("Erreur lors de la connexion à GemWallet");
    return null;
  }
};

export const fetchNFTInfo = async (nftID: string): Promise<any> => {
  try {
    const response = await fetch(`${apiBase}/nft/fetch/${nftID}`);
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur lors du fetch NFT:", err);
    return err;
  }
};

export const fetchNFTs = async (): Promise<any> => {
  try {
    const response = await fetch(`${apiBase}/nft/fetch`);
    if (!response.ok) {
      throw new Error("Erreur réseau");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur lors du fetch NFTs:", err);
    return err;
  }
};

export function extractOfferID(meta: any): string | undefined {
  const nodes = meta?.AffectedNodes;

  if (!Array.isArray(nodes)) {
    console.error("❌ AffectedNodes n’est pas un tableau :", nodes);
    return undefined;
  }

  for (const node of nodes) {
    const created = node.CreatedNode;
    if (created?.LedgerEntryType === "NFTokenOffer") {
      return created.LedgerIndex;
    }
  }

  return undefined;
}

export const mintNewNFT = async (nftData: NFTData): Promise<any> => {
  try {
    const response = await fetch(`${apiBase}/nft/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nftData),
    });

    if (!response.ok) {
      throw new Error("Erreur réseau");
    }

    const data = await response.json();
    const offerID = data.offerID;
    const tokenID = data.tokenId;
    const userAddress = nftData.address;
    const uri = data.uri;

    if (!offerID) {
      throw new Error("Offer ID introuvable !");
    }

    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const acceptTx: NFTokenAcceptOffer = {
      TransactionType: "NFTokenAcceptOffer",
      Account: userAddress,
      NFTokenSellOffer: offerID,
    };

    const result = await submitTransaction({
      transaction: acceptTx,
    });

    console.log("Transaction acceptée :", result);

    return {
      tokenId: tokenID,
      offerID: offerID,
      result: result,
      uri: uri,
    };
  } catch (err) {
    console.error("❌ Erreur lors du mint ou de l'acceptation :", err);
    return err;
  }
};

export const createOfferNft = async (price: string, nft_id: string, address: string): Promise<any> => {
  try {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const tx1: NFTokenCreateOffer = {
      TransactionType: "NFTokenCreateOffer",
      Account: address,
      NFTokenID: nft_id,
      Amount: price,
      Flags: 1,
    };

    const prepared1 = await client.autofill(tx1);
    const signed1 = await submitTransaction({
      transaction: prepared1,
    });

    console.log("Transaction signée :", signed1);
  } catch (err) {
    console.error("Erreur lors du mint NFT:", err);
    return err;
  }
};

export const buyNFT = async (nft_id: string, address: string): Promise<any> => {
  try {
    const response = await fetch(`${apiBase}/nft/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nft_id }),
    });

    const data = await response.json();
    console.log("NFT acheté :", data);

    const tx: NFTokenAcceptOffer = {
      TransactionType: "NFTokenAcceptOffer",
      Account: address,
      NFTokenSellOffer: data.offer,
    };

    const signed = await submitTransaction({
      transaction: tx,
    });

    console.log("Transaction signée :", signed);
  } catch (err) {
    console.error("Erreur lors de l'achat NFT:", err);
    return err;
  }
};

export const claimTokens = async (nft_id : string, address: string): Promise<any> => {
  try {
      console.log("Claiming tokens for NFT ID:", nft_id);
      console.log("Claiming tokens for address:", address);

      const currency = "FST";
      const issuerWalletAddress = "rNKB7zoaWiR1vacQDrvx1JKYzptjbiqnaE";
      // Create trustline from destination wallet to issuer
      console.log("Creating trustline from destination wallet to token issuer...");
      const destTrustSetTx : xrpl.TrustSet = {
      "TransactionType": "TrustSet",
      "Account": address,
      "LimitAmount": {
          "currency": currency,
          "value": "1000000", 
          "issuer": issuerWalletAddress
      }
      };
      
      const signed = await submitTransaction({
          transaction: destTrustSetTx,
        });

      console.log("Destination trustline created:", signed);
  
      const response = await fetch(`http://localhost:8080/nft/claim`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nft_id, address }),
      });
      if (!response.ok) {
          throw new Error('Erreur réseau');
      }
      const data = await response.json();
      console.log("Tokens réclamés :", data);
      return data;
  } catch (err) {
    console.error('Erreur lors du fetch NFTs:', err);
    return err;
  }
}