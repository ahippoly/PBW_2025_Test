import { Request, Response } from 'express'
import { uploadToIPFS, uploadToIPFSFile, getJSONFromIPFS } from '../services/ipfsService'
import { generateOreContractPDF } from '../services/fileService'
import * as xrpl from "xrpl"
import crypto from 'crypto'
import { extractNFTokenID, getNFTInfo, LandMetadata, getSellInformation } from './nftUtils'
import axios  from 'axios'

const XRPL_NODE = "wss://s.altnet.rippletest.net:51233"
const TAXON = 1338

const createNFT = async (gps: string, surface: number, owner: string, terrain_id: string, ref_cad: string): Promise<string> => {
  try {
    

    const landMetadata : LandMetadata = {
      "nft_id" : terrain_id,
      "gps": gps,
      "ref_cad": ref_cad,
      "surface": surface,
      "owner": owner,
      "platform" : "GreenLock"
  }
    const fileName = `contrat-ORE-${terrain_id}.pdf`
    // Upload the PDF to IPFS
    const file = await generateOreContractPDF(landMetadata)
    const ipfs_uri_file = await uploadToIPFSFile(file, fileName)

    landMetadata.contract_uri = ipfs_uri_file
    console.log("✅ PDF uploadé sur IPFS avec succès :", ipfs_uri_file)

    const ipfs_uri = await uploadToIPFS(landMetadata, `${terrain_id}.json`)

    return ipfs_uri
  } catch (error) {
    console.error(error)
    throw new Error("Failed to create NFT")
  }
}

export const createOffer =  async (seed : string, token_id : string, price : string): Promise<void> => {
  try {
    const client = new xrpl.Client(XRPL_NODE)

    await client.connect()

    const wallet = xrpl.Wallet.fromSeed(seed)
    const classicAddress = wallet.classicAddress

    const tx: xrpl.NFTokenCreateOffer = {
      TransactionType: "NFTokenCreateOffer",
      Account: classicAddress,
      NFTokenID: token_id,
      Amount: price,
      Flags: 1,
    }

    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("✅ Offre créée avec succès :", result)
    await client.disconnect()
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'offre :", error)
  } 
}




export const mintNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gps, surface_ha, seed, ref_cad, price} = req.body

    const terrain_id = `T-${crypto.randomUUID()}`

    const client = new xrpl.Client(XRPL_NODE)
    await client.connect()

    const wallet = xrpl.Wallet.fromSeed(seed)
    const classicAddress = wallet.classicAddress

    const ipfsUri = await createNFT(gps, surface_ha, classicAddress, terrain_id, ref_cad)

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
            MemoData: xrpl.convertStringToHex(terrain_id)
          }
        },
        {
          Memo: {
            MemoType: xrpl.convertStringToHex("platform"),
            MemoData: xrpl.convertStringToHex("GreenLock")
          }
        }
      ]
    }

    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("✅ NFT minté avec succès :", result)

    const tokenId = extractNFTokenID(result.result.meta)
    if (!tokenId) {
      throw new Error("Token ID not found in the transaction result")
    }
    console.log("✅ Token ID extrait avec succès :", tokenId)

    // Create an offer for the NFT
    createOffer(seed, tokenId, price)
    console.log("✅ Offre créée avec succès :", result)

    // Send the response  
    res.status(200).json({ message: 'NFT minted successfully', result })
    await client.disconnect()
  } catch (error) {
      console.error("❌ Erreur lors de la création de l'NFT :", error)
      res.status(500).json({ error: 'Failed to mint NFT' })
      return
    }
}

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


export const fetchNFTs = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = new xrpl.Client(XRPL_NODE)
    await client.connect()  

    const res_minted = await client.request({
      command: 'account_tx',
      account: 'rNKB7zoaWiR1vacQDrvx1JKYzptjbiqnaE',
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 200
    })
    
    const minted = res_minted.result.transactions.filter(
      tx => tx.tx!.TransactionType === 'NFTokenMint'
    )

    console.log("✅ Transactions mintées récupérées avec succès :", minted)

    const mintedNFTIds: string[] = []

    for (const tx of minted) {
      const id = xrpl.getNFTokenID(tx.meta);
      if (!id) {
        console.log("❌ ID non trouvé dans la transaction :", tx)
        continue
      }
      mintedNFTIds.push(id);
    }

    const cleanIds = mintedNFTIds.filter((id): id is string => typeof id === 'string')

    const nftInfos: (LandMetadata | null)[] = []

    for (const id of cleanIds) {
      const result = await getNFTInfo(id)
      if (!result) {
        console.log("❌ Résultat non trouvé pour le NFT ID :", id)
        continue
      }

      const decodedUri = Buffer.from(result.uri, 'hex').toString('utf-8');
      console.log('✅ URI décodée:', decodedUri);

      if (!decodedUri) {
        console.log("❌ URI non trouvée pour le NFT ID :", id)
        continue
      }
      try {
        const nftJsonInfo = await getJSONFromIPFS(decodedUri)
        if (!nftJsonInfo) {
          console.log("❌ JSON non trouvé pour le NFT ID :", id)
          continue
        }

        console.log("✅ JSON récupéré avec succès :", nftJsonInfo)
        const sellInfo = await getSellInformation(id, client)
       
        nftJsonInfo.forSale = sellInfo.forSale
        nftJsonInfo.price = sellInfo.price
        nftJsonInfo.owner = sellInfo.owner
        

        nftInfos.push(nftJsonInfo)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.warn('⚠️ Accès refusé (403), on ignore cette requête.')
        }
        else {
          console.error('❌ Erreur lors de la récupération du JSON depuis IPFS :', error)
        }
      }
    }
    
    await client.disconnect()

    res.status(200).json({ nfts: nftInfos.filter((nft): nft is LandMetadata => nft !== null) })
    
    
  } catch (error) {
      console.error("❌ Erreur lors de la récupération des NFTs :", error)
      res.status(500).json({ error: 'Failed to fetch NFTs' })
    }
}

export const buyNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { seed, token_id, price, owner } = req.body

    const client = new xrpl.Client(XRPL_NODE)
    await client.connect()

    const wallet = xrpl.Wallet.fromSeed(seed)
    const classicAddress = wallet.classicAddress

    const tx: xrpl.NFTokenCreateOffer = {
      TransactionType: "NFTokenCreateOffer",
      Account: classicAddress,
      NFTokenID: token_id,
      Amount: price,
      Owner: owner,
      Flags: 0,
    }

    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("✅ NFT acheté avec succès :", result)
    res.status(200).json({ message: 'NFT bought successfully', result })
    await client.disconnect()
  } catch (error) {
      console.error("❌ Erreur lors de l'achat de l'NFT :", error)
      res.status(500).json({ error: 'Failed to buy NFT' })
      return
    }
}

// Example usage
/*curl --location 'http://localhost:3000/nft/buy' \
--header 'Content-Type: application/json' \
--data '{
  "seed": "sEdTWKML7kvEVgVmgZW6MiHqGgTaFkq",
  "token_id": "000800009209DF7E04213C14E9AC90E72AD8D6AC8B18403CF8C04CED005F443C",
  "price": "1000000",
  "owner": "rNKB7zoaWiR1vacQDrvx1JKYzptjbiqnaE"
}' */

