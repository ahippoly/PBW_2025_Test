import express from 'express'
import { mintNFT, fetchNFTs, buyNFT, fetchNFT } from './nft'

const router = express.Router()

router.post('/create', mintNFT)
router.get('/fetch', fetchNFTs)
router.post('/buy', buyNFT)
router.get('/fetch/:token_id', fetchNFT)

export default router