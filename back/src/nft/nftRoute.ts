import express from 'express'
import { mintNFT, fetchNFTs, buyNFT } from './nft'

const router = express.Router()

router.post('/create', mintNFT)
router.get('/fetch', fetchNFTs)
router.post('/buy', buyNFT)

export default router