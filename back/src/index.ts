import express from 'express';
import dotenv from "dotenv"
import nftRoutes from './nft/nftRoute'
import cors from 'cors'

dotenv.config()


const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

app.use('/nft', nftRoutes)

app.get('/', (_req, res) => {
  res.send("🌿 l'API est en ligne !");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});