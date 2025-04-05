const xrpl = require('xrpl');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const express = require('express');

// Créer une application Express
const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Variables globales pour stocker les wallets
let client;
let wallet;
let issuerWallet;
let destinationWallet;
let currency = 'FST';
const nftID = "000800009209DF7E04213C14E9AC90E72AD8D6AC8B18403CCAF4A2EC005F443A";

// Endpoint pour servir la page HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint pour afficher le contenu du wallet
app.get('/display-wallet', async (req, res) => {
  try {
    if (!client || !destinationWallet) {
      return res.status(400).json({ error: 'Wallet non initialisé' });
    }
    
    // Récupérer les informations du compte
    const accountInfo = await client.request({
      command: "account_info",
      account: destinationWallet.address,
      ledger_index: "validated"
    });
    
    // Récupérer les NFTs du compte
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: destinationWallet.address,
      ledger_index: "validated"
    });
    
    // Récupérer les lignes de confiance (tokens)
    const accountLines = await client.request({
      command: "account_lines",
      account: destinationWallet.address,
      ledger_index: "validated"
    });
    
    // Construire la réponse
    const walletInfo = {
      address: destinationWallet.address,
      xrpBalance: xrpl.dropsToXrp(accountInfo.result.account_data.Balance),
      nfts: nftsResponse.result.account_nfts,
      tokens: accountLines.result.lines
    };
    
    res.json(walletInfo);
  } catch (error) {
    console.error('Erreur lors de la récupération du wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour réclamer les tokens FST
app.post('/claim-tokens', async (req, res) => {
  try {
    if (!client || !issuerWallet || !destinationWallet) {
      return res.status(400).json({ error: 'Wallets non initialisés' });
    }
    
    // Vérifier si le NFT existe dans le wallet
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: destinationWallet.address,
      ledger_index: "validated"
    });
    
    const nftExists = nftsResponse.result.account_nfts.some(nft => 
      nft.NFTokenID === nftID
    );
    
    if (!nftExists) {
      return res.status(400).json({ error: 'NFT non trouvé dans le wallet' });
    }
    
    // Calculer les tokens à réclamer
    const claimData = loadClaimData();
    const lastClaimTime = claimData[nftID] || simulateMintTime();
    const secondsElapsed = calculateSecondsElapsed(lastClaimTime);
    const tokensToMint = secondsElapsed;
    
    console.log(`Tokens to mint: ${tokensToMint} FST`);
    
    // Mettre à jour la date de réclamation
    claimData[nftID] = new Date().toISOString();
    saveClaimData(claimData);
    
    // Mint les tokens réclamés
    const claimTx = {
      "TransactionType": "Payment",
      "Account": issuerWallet.address,
      "Destination": destinationWallet.address,
      "Amount": {
        "currency": currency,
        "value": tokensToMint.toString(),
        "issuer": issuerWallet.address
      }
    };
    
    const claimResult = await client.submitAndWait(claimTx, {
      wallet: issuerWallet
    });
    
    // Vérifier le solde après la réclamation
    const destAccountLines = await client.request({
      command: "account_lines",
      account: destinationWallet.address,
      ledger_index: "validated"
    });
    
    let currentBalance = 0;
    destAccountLines.result.lines.forEach(line => {
      if (line.currency === currency && line.account === issuerWallet.address) {
        currentBalance = parseFloat(line.balance);
      }
    });
    
    res.json({ 
      success: true, 
      amount: tokensToMint, 
      transaction: claimResult.result.hash,
      currentBalance: currentBalance
    });
  } catch (error) {
    console.error('Erreur lors de la réclamation des tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fonction pour simuler une date de mint (10 minutes dans le passé)
function simulateMintTime() {
  const mintDate = new Date();
  mintDate.setMinutes(mintDate.getMinutes() - 10);
  return mintDate.toISOString();
}

// Fonction pour calculer le temps écoulé en secondes
function calculateSecondsElapsed(lastClaimTime) {
  const lastClaim = new Date(lastClaimTime);
  const now = new Date();
  const diffMs = now - lastClaim;
  return Math.floor(diffMs / 1000);
}

// Fonction pour charger les données de réclamation
function loadClaimData() {
  try {
    if (fs.existsSync('claims.json')) {
      const data = fs.readFileSync('claims.json', 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading claim data:', error);
    return {};
  }
}

// Fonction pour sauvegarder les données de réclamation
function saveClaimData(data) {
  try {
    fs.writeFileSync('claims.json', JSON.stringify(data, null, 2));
    console.log('Updated claims data saved');
  } catch (error) {
    console.error('Error saving claim data:', error);
  }
}

// Fonction pour vérifier si un NFT existe dans un wallet
async function checkNFTAndGetMetadata(client, walletAddress, nftID) {
  try {
    console.log(`Checking if NFT ${nftID} exists in wallet ${walletAddress}...`);
    
    // Get account NFTs
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: walletAddress,
      ledger_index: "validated"
    });
    
    // Check if the NFT exists in the wallet
    const nftExists = nftsResponse.result.account_nfts.some(nft => 
      nft.NFTokenID === nftID
    );
    
    if (nftExists) {
      console.log(`NFT ${nftID} found in wallet ${walletAddress}`);
      return true;
    } else {
      console.log(`NFT ${nftID} not found in wallet ${walletAddress}`);
      return false;
    }
  } catch (error) {
    console.error("Error checking NFT:", error);
    return false;
  }
}

// Fonction principale d'initialisation
async function initializeWallets() {
  try {
    console.log("Initializing XRPL connection and wallets...");
    
    // Connect to XRPL testnet
    client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("Connected to XRPL testnet");
    
    // Create a backend wallet
    wallet = xrpl.Wallet.generate();
    console.log("Backend wallet created with address:", wallet.address);
    
    // Fund the wallet
    console.log("Funding backend wallet...");
    const fundResult = await client.fundWallet(wallet);
    const balance = xrpl.dropsToXrp(fundResult.balance);
    console.log(`Funded wallet with ${balance} XRP`);
    
    // Create an issuer wallet for the token
    issuerWallet = xrpl.Wallet.generate();
    console.log("Issuer wallet created with address:", issuerWallet.address);
    
    // Fund the issuer wallet
    console.log("Funding issuer wallet...");
    const issuerFundResult = await client.fundWallet(issuerWallet);
    console.log(`Funded issuer wallet with ${xrpl.dropsToXrp(issuerFundResult.balance)} XRP`);
    
    // Destination wallet - using a fixed seed for testing
    const destinationSeed = 'sEdSuAKpvahUG1bXHdmLdnH2vhF68Xi';
    destinationWallet = xrpl.Wallet.fromSeed(destinationSeed);
    console.log(`Destination wallet address: ${destinationWallet.address}`);
    
    // Configure issuer account settings
    console.log("Configuring issuer account settings...");
    const issuerSettingsTx = {
      "TransactionType": "AccountSet",
      "Account": issuerWallet.address,
      "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple
    };
    
    const issuerSettingsResult = await client.submitAndWait(issuerSettingsTx, {
      wallet: issuerWallet
    });
    console.log("Issuer account configured:", issuerSettingsResult.result.meta.TransactionResult);
    
    // Create trustline from destination wallet to issuer
    console.log("Creating trustline from destination wallet to token issuer...");
    const destTrustSetTx = {
      "TransactionType": "TrustSet",
      "Account": destinationWallet.address,
      "LimitAmount": {
        "currency": currency,
        "value": "1000000", // Une limite élevée pour accommoder les futurs claims
        "issuer": issuerWallet.address
      }
    };
    
    const destTrustSetResult = await client.submitAndWait(destTrustSetTx, {
      wallet: destinationWallet
    });
    console.log("Destination trustline created:", destTrustSetResult.result.meta.TransactionResult);
    
    // Save wallet information to a file
    const walletInfo = {
      backendWallet: {
        address: wallet.address,
        seed: wallet.seed
      },
      issuerWallet: {
        address: issuerWallet.address,
        seed: issuerWallet.seed
      },
      destinationWallet: {
        address: destinationWallet.address,
        seed: destinationWallet.seed
      }
    };
    
    fs.writeFileSync('wallet-info.json', JSON.stringify(walletInfo, null, 2));
    console.log("Wallet information saved to wallet-info.json");
    
    console.log("\nInitialization complete! Server is ready.");
    
  } catch (error) {
    console.error("Error in initialization:", error);
    if (client && client.isConnected()) {
      client.disconnect();
    }
    process.exit(1);
  }
}

// Démarrer le serveur et initialiser les wallets
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await initializeWallets();
});

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  console.log('Disconnecting from XRPL');
  if (client && client.isConnected()) {
    await client.disconnect();
  }
  process.exit(0);
});
