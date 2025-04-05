import axios from 'axios'
import dotenv from 'dotenv'


dotenv.config()



export async function uploadToIPFS(landMetadata : object, fileName: string): Promise<string> {
  try {
    console.log('📦 Uploading JSON to Pinata...')
    console.log('📦 JSON :', landMetadata)
    console.log('📦 File name :', fileName)
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata: {
          name: fileName
        },
        pinataContent: landMetadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT!}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const cid = res.data.IpfsHash
    const uri = `ipfs://${cid}/${fileName}`

    console.log('✅ JSON IPFS uploadé :', uri)
    return uri
  } catch (error) {
    console.error('❌ Erreur upload Pinata :', error)
    throw error
  }
}

export async function uploadToIPFSFile(file: Buffer, fileName: string): Promise<string> {
  try {
    console.log('📦 Uploading file to Pinata...')
    console.log('📦 File name :', fileName)
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      file,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT!}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const cid = res.data.IpfsHash
    const uri = `ipfs://${cid}/${fileName}`

    console.log('✅ File IPFS uploadé :', uri)
    return uri
  } catch (error) {
    console.error('❌ Erreur upload Pinata :', error)
    throw error
  }
}