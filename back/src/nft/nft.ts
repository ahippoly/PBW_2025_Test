import { Request, Response } from 'express'
import { uploadToIPFS, uploadToIPFSFile } from '../services/ipfsService'
import * as xrpl from "xrpl"
import crypto from 'crypto'

const XRPL_NODE = "wss://s.altnet.rippletest.net:51233"
const TAXON = 1337

const createNFT = async (gps: string, surface: number, owner: string, terrain_id: string, ref_cad: string): Promise<string> => {
  try {
    

    const landMetadata = {
      "nft_id" : terrain_id,
      "gps": gps,
      "ref_cad": ref_cad,
      "surface": surface,
      "owner": owner,
      "platform" : "GreenLock"
  }

    const ipfs_uri = await uploadToIPFS(landMetadata, `${terrain_id}.json`)

    return ipfs_uri
  } catch (error) {
    console.error(error)
    throw new Error("Failed to create NFT")
  }
}



export const mintNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gps, surface_ha, seed, ref_cad} = req.body

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
    res.status(200).json({ message: 'NFT minted successfully', result })
    await client.disconnect()
  } catch (error) {
      console.error("❌ Erreur lors de la création de l'NFT :", error)
      res.status(500).json({ error: 'Failed to mint NFT' })
      return
    }
}

export const testFile = async (req: Request, res: Response): Promise<void> => {
  try {
    
    res.status(200).json({ message: 'Test file endpoint' })
    return
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
  "ref_cad": "123456789"
}'*/
