import express from 'express'
import { mintNFT, testFile } from './nft'

const router = express.Router()

router.post('/create', mintNFT)

router.post("/test", testFile)

export default router