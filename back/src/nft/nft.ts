import { Request, Response } from "express";
import { uploadToIPFS, uploadToIPFSFile, getJSONFromIPFS } from "../services/ipfsService";
import { generateOreContractPDF } from "../services/fileService";
import * as xrpl from "xrpl";
import crypto from "crypto";
import { extractNFTokenID, getNFTInfo, LandMetadata, getSellInformation, simulateMintTime, calculateSecondsElapsed } from "./nftUtils";
import { loadClaimData, saveClaimData } from "../services/fileService";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const XRPL_NODE = "wss://s.altnet.rippletest.net:51233";
const TAXON = 1338;

const createNFT = async (gps: string, surface: number, owner: string, terrain_id: string, ref_cad: string): Promise<string> => {
  try {
    const landMetadata: LandMetadata = {
      land_id: terrain_id,
      gps: gps,
      ref_cad: ref_cad,
      surface: surface,
      owner: owner,
      mint_date: new Date().toISOString(),
      platform: "GreenLock",
    };
    const fileName = `contrat-ORE-${terrain_id}.pdf`;
    // Upload the PDF to IPFS
    const file = await generateOreContractPDF(landMetadata);
    const ipfs_uri_file = await uploadToIPFSFile(file, fileName);

    landMetadata.contract_uri = ipfs_uri_file;
    console.log("✅ PDF uploadé sur IPFS avec succès :", ipfs_uri_file);

    const ipfs_uri = await uploadToIPFS(landMetadata, `${terrain_id}.json`);

    return ipfs_uri_file;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create NFT");
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token_id, price, address } = req.body;

    const client = new xrpl.Client(XRPL_NODE);

    await client.connect();

    const tx: xrpl.NFTokenCreateOffer = {
      TransactionType: "NFTokenCreateOffer",
      Account: address,
      NFTokenID: token_id,
      Amount: price,
      Flags: 1,
    };

    //const prepared = await client.autofill(tx)

    await client.disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'offre :", error);
  }
};

// export function extractOfferID(meta: any): string | undefined {
//   const nodes = meta.AffectedNodes;
//   for (const node of nodes) {
//     const created = node.CreatedNode;
//     if (created?.LedgerEntryType === "NFTokenOffer") {
//       return created.LedgerIndex;
//     }
//   }
//   return undefined;
// }

export function extractOfferID(meta: any): string | undefined {
  const nodes = meta?.AffectedNodes;

  console.log("🚀 ~ extractOfferID ~ nodes:", JSON.stringify(nodes, null, 2));

  if (!Array.isArray(nodes)) {
    console.error("❌ AffectedNodes n'est pas un tableau :", nodes);
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

export const mintNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gps, surface, ref_cad, price, address } = req.body;

    const terrain_id = `T-${crypto.randomUUID()}`;

    const client = new xrpl.Client(XRPL_NODE);
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed(process.env.SECRET_KEY!);
    const classicAddress = wallet.classicAddress;

    const ipfsUri = await createNFT(gps, surface, address, terrain_id, ref_cad);

    const tx: xrpl.NFTokenMint = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: xrpl.convertStringToHex(ipfsUri),
      Flags: 8, // transferrable
      NFTokenTaxon: TAXON,
      Memos: [
        {
          Memo: {
            MemoType: xrpl.convertStringToHex("name"),
            MemoData: xrpl.convertStringToHex(terrain_id),
          },
        },
        {
          Memo: {
            MemoType: xrpl.convertStringToHex("platform"),
            MemoData: xrpl.convertStringToHex("GreenLock"),
          },
        },
      ],
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("✅ NFT minté avec succès :", result);

    const tokenId = extractNFTokenID(result.result.meta);
    if (!tokenId) {
      throw new Error("Token ID not found in the transaction result");
    }
    console.log("✅ Token ID extrait avec succès :", tokenId);

    const txOffer: xrpl.NFTokenCreateOffer = {
      TransactionType: "NFTokenCreateOffer",
      Account: wallet.classicAddress,
      NFTokenID: tokenId,
      Destination: address,
      Amount: "0",
      Flags: 1,
    };

    const preparedOffer = await client.autofill(txOffer);
    const signedOffer = wallet.sign(preparedOffer);
    const resultOffer = await client.submitAndWait(signedOffer.tx_blob);
    console.log("🚀 ~ mintNFT ~ resultOffer:", resultOffer);

    const offerID = extractOfferID(resultOffer.result.meta);
    if (!offerID) {
      throw new Error("Offer ID not found in the transaction result");
    }
    console.log("✅ Offer ID extrait avec succès :", offerID);

    // Send the response
    res.status(200).json({ tokenId, offerID, result: resultOffer, uri: ipfsUri });
    await client.disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'NFT :", error);
    res.status(500).json({ error: "Failed to mint NFT" });
    return;
  }
};

// Example usage
/*curl --location 'http://localhost:3000/nft/create' \
--header 'Content-Type: application/json' \
--data '{
  "gps": "48.8566,2.3522",
  "surface_ha": 2.3,
  "seed": "sEdSuAKpvahUG1bXHdmLdnH2vhF68Xi",
  "ref_cad": "123456789",
  "price": "1000000"
}'*/

export const fetchNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token_id } = req.params;
    const client = new xrpl.Client(XRPL_NODE);
    await client.connect();

    const result = await getNFTInfo(token_id);
    console.log("✅ NFT info récupéré avec succès :", result);

    if (!result) {
      console.log("❌ Résultat non trouvé pour le NFT ID :", token_id);
      res.status(404).json({ error: "NFT not found" });
      return;
    }
    const decodedUri = Buffer.from(result.uri, "hex").toString("utf-8");
    console.log("✅ URI décodée:", decodedUri);
    if (!decodedUri) {
      console.log("❌ URI non trouvée pour le NFT ID :", token_id);
      res.status(404).json({ error: "NFT not found" });
      return;
    }
    try {
      const nftJsonInfo = await getJSONFromIPFS(decodedUri);
      if (!nftJsonInfo) {
        console.log("❌ JSON non trouvé pour le NFT ID :", token_id);
        res.status(404).json({ error: "NFT not found" });
        return;
      }
      console.log("✅ JSON récupéré avec succès :", nftJsonInfo);
      const sellInfo = await getSellInformation(token_id, client);
      nftJsonInfo.forSale = sellInfo.forSale;
      nftJsonInfo.price = sellInfo.price;
      nftJsonInfo.owner = sellInfo.owner;
      res.status(200).json({ nft: nftJsonInfo });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        console.warn("⚠️ Accès refusé (403), on ignore cette requête.");
      } else {
        console.error("❌ Erreur lors de la récupération du JSON depuis IPFS :", error);
      }
      res.status(404).json({ error: "NFT not found" });
    }
    await client.disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du NFT :", error);
    res.status(500).json({ error: "Failed to fetch NFT" });
  }
};

export const fetchNFTs = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = new xrpl.Client(XRPL_NODE);
    await client.connect();

    const res_minted = await client.request({
      command: "account_tx",
      account: "rNKB7zoaWiR1vacQDrvx1JKYzptjbiqnaE",
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 200,
    });
    console.log("🚀 ~ minted ~ res_minted.result.transactions:", res_minted.result.transactions);

    const minted = res_minted.result.transactions.filter((tx) => {
      const transaction = tx.tx_json as unknown as { TransactionType?: string };
      return transaction && transaction.TransactionType === "NFTokenMint";
    });
    const last5Minted = minted.slice(-5);

    console.log("✅ Transactions mintées récupérées avec succès :", minted);

    const mintedNFTIds: string[] = [];

    for (const tx of last5Minted) {
      const id = xrpl.getNFTokenID(tx.meta);
      if (!id) {
        console.log("❌ ID non trouvé dans la transaction :", tx);
        continue;
      }
      mintedNFTIds.push(id);
    }

    const cleanIds = mintedNFTIds.filter((id): id is string => typeof id === "string");

    const nftInfos: (LandMetadata | null)[] = [];

    for (const id of cleanIds) {
      const result = await getNFTInfo(id);
      if (!result) {
        console.log("❌ Résultat non trouvé pour le NFT ID :", id);
        continue;
      }

      const decodedUri = Buffer.from(result.uri, "hex").toString("utf-8");
      console.log("✅ URI décodée:", decodedUri);

      if (!decodedUri) {
        console.log("❌ URI non trouvée pour le NFT ID :", id);
        continue;
      }
      try {
        const nftJsonInfo = await getJSONFromIPFS(decodedUri);
        if (!nftJsonInfo) {
          console.log("❌ JSON non trouvé pour le NFT ID :", id);
          continue;
        }

        console.log("✅ JSON récupéré avec succès :", nftJsonInfo);
        const sellInfo = await getSellInformation(id, client);

        nftJsonInfo.forSale = sellInfo.forSale;
        nftJsonInfo.price = sellInfo.price;
        nftJsonInfo.owner = sellInfo.owner;
        nftJsonInfo.nft_id = id;

        nftInfos.push(nftJsonInfo);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.warn("⚠️ Accès refusé (403), on ignore cette requête.");
        } else {
          console.error("❌ Erreur lors de la récupération du JSON depuis IPFS :", error);
        }
      }
    }

    await client.disconnect();

    res.status(200).json({ nfts: nftInfos.filter((nft): nft is LandMetadata => nft !== null) });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des NFTs :", error);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }
};

export const buyNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nft_id } = req.body;

    console.log("📦 NFT ID :", nft_id);

    const client = new xrpl.Client(XRPL_NODE);
    await client.connect();

    const result = await client.request({
      command: "nft_sell_offers",
      nft_id: nft_id,
    });
    console.log("📦 Réponse Clio:\n", JSON.stringify(result, null, 2));

    const offer = result.result.offers[0];
    if (!offer) {
      console.log("❌ Offre non trouvée pour le NFT ID :", nft_id);
      res.status(500).json({ error: "NFT not found" });
      return;
    } else {
      console.log("✅ Offre trouvée pour le NFT ID :", nft_id);
      res.status(200).json({ offer: offer.nft_offer_index });
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'achat de l'NFT :", error);
    res.status(500).json({ error: "Failed to buy NFT" });
    return;
  }
};

export const acceptOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transaction } = req.body;
    const client = new xrpl.Client(XRPL_NODE);
    await client.connect();

    const tx_blob = xrpl.encode(transaction);

    const submitResult = await client.submitAndWait(tx_blob);
    console.log("✅ Offre acceptée avec succès :", submitResult);
    res.status(200).json({ message: "Offer accepted successfully", result: submitResult });
    await client.disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de l'acceptation de l'offre :", error);
    res.status(500).json({ error: "Failed to accept offer" });
    return;
  }
};

// Example usage
/*curl --location 'http://localhost:3000/nft/buy' \
--header 'Content-Type: application/json' \
--data '{
  "seed": "sEdTWKML7kvEVgVmgZW6MiHqGgTaFkq",
  "token_id": "000800009209DF7E04213C14E9AC90E72AD8D6AC8B18403CF8C04CED005F443C",
  "price": "1000000",
  "owner": "rNKB7zoaWiR1vacQDrvx1JKYzptjbiqnaE"
}' */

export const claimNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nft_id, address } = req.body;

    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    const issuerWallet = xrpl.Wallet.fromSeed(process.env.SECRET_KEY!);
    const currency = "FST";

    // Vérifier si le NFT existe dans le wallet
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: address,
      ledger_index: "validated",
    });

    const nftExists = nftsResponse.result.account_nfts.some((nft) => nft.NFTokenID === nft_id);

    if (!nftExists) {
      res.status(400).json({ error: "NFT non trouvé dans le wallet" });
    }

    // Calculer les tokens à réclamer
    const claimData = loadClaimData();

    const lastClaimTime = claimData[nft_id]?.lastClaim || simulateMintTime();
    const secondsElapsed = calculateSecondsElapsed(lastClaimTime);
    const tokensToMint = secondsElapsed;

    console.log(`Tokens to mint: ${tokensToMint} FST`);

    // Mettre à jour la date de réclamation
    claimData[nft_id] = {
      lastClaim: new Date().toISOString(),
    };
    saveClaimData(claimData);

    // Mint les tokens réclamés
    const claimTx: xrpl.Payment = {
      TransactionType: "Payment",
      Account: issuerWallet.address,
      Destination: address,
      Amount: {
        currency: currency,
        value: tokensToMint.toString(),
        issuer: issuerWallet.address,
      },
    };

    const preparedClaim = await client.autofill(claimTx);
    const signedClaim = issuerWallet.sign(preparedClaim);
    const claimResult = await client.submitAndWait(signedClaim.tx_blob);

    // Vérifier le solde après la réclamation
    const destAccountLines = await client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
    });

    let currentBalance = 0;
    destAccountLines.result.lines.forEach((line) => {
      if (line.currency === currency && line.account === issuerWallet.address) {
        currentBalance = parseFloat(line.balance);
      }
    });

    res.status(200).json({
      amount: tokensToMint,
      transaction: claimResult.result.hash,
      currentBalance: currentBalance,
    });
  } catch (error) {
    console.error("Erreur lors de la réclamation des tokens:", error);
    res.status(500).json({ Error: "Erreur lors de la réclamation des tokens" });
  }
};
