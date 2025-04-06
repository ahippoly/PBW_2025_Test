import express from 'express'
import { mintNFT, fetchNFTs, buyNFT, fetchNFT, createOffer, acceptOffer, claimNFT} from './nft'

const router = express.Router()

router.post('/mint', mintNFT)
router.post('/createOffer', createOffer)
router.get('/fetch', fetchNFTs)
router.post('/buy', buyNFT)
router.post('/accept', acceptOffer)
router.get('/fetch/:token_id', fetchNFT)
router.post('/claim', claimNFT)

export default router