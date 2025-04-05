import express from 'express'
import { mintNFT, fetchNFTs } from './nft'

const router = express.Router()

router.post('/create', mintNFT)
router.get('/fetch', fetchNFTs)

export default router