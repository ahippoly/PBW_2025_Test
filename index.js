const xrpl = require('xrpl');
const fetch = require('node-fetch');
require('dotenv').config();

// Main function to execute all operations
async function main() {
  console.log("Connecting to XRPL Testnet...");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  
  try {
    // Step 1: Create a wallet called "backend"
    console.log("\n=== Step 1: Creating 'backend' wallet ===");
    const wallet = xrpl.Wallet.generate();
    console.log("Wallet created with address:", wallet.address);
    console.log("Wallet seed:", wallet.seed);
    
    // Wait a moment before proceeding to next step
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Request XRP from testnet faucet
    console.log("\n=== Step 2: Requesting XRP from testnet faucet ===");
    const fundResult = await client.fundWallet(wallet);
    const balance = xrpl.dropsToXrp(fundResult.balance);
    console.log(`Funded wallet with ${balance} XRP`);
    
    // Wait a moment before proceeding to next step
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Mint FST token (create a trustline and issue the token)
    console.log("\n=== Step 3: Creating and minting FST token ===");
    
    // Create a currency code for FST
    const currency = 'FST';
    
    // Create an issuer wallet for the token
    const issuerWallet = xrpl.Wallet.generate();
    console.log("Issuer wallet created with address:", issuerWallet.address);
    
    // Fund the issuer wallet
    console.log("Funding issuer wallet...");
    const issuerFundResult = await client.fundWallet(issuerWallet);
    console.log(`Funded issuer wallet with ${xrpl.dropsToXrp(issuerFundResult.balance)} XRP`);
    
    // Wait a moment before proceeding
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Destination address for token transfer - this appears to be a seed, not an address
    const destinationSeed = 'sEdSuAKpvahUG1bXHdmLdnH2vhF68Xi';
    let destinationWallet;
    
    try {
      // Try to convert the seed to a wallet to get the address
      destinationWallet = xrpl.Wallet.fromSeed(destinationSeed);
      console.log(`Destination wallet address: ${destinationWallet.address}`);
      
      // Wait a moment before proceeding
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // NEW STEP: Check for NFT in destination wallet
      console.log("\n=== Checking for NFT in destination wallet ===");
      const nftID = "000800009209DF7E04213C14E9AC90E72AD8D6AC8B18403CCAF4A2EC005F443A";
      
      // Query account NFTs
      console.log(`Looking for NFT with ID: ${nftID}`);
      const nftResponse = await client.request({
        command: "account_nfts",
        account: destinationWallet.address,
        ledger_index: "validated"
      });
      
      // Check if the NFT exists in the account
      const foundNFT = nftResponse.result.account_nfts.find(nft => 
        nft.NFTokenID === nftID
      );
      
      if (foundNFT) {
        console.log("NFT found in destination wallet!");
        console.log("NFT details from XRPL:");
        console.log(JSON.stringify(foundNFT, null, 2));
        
        // Implement CLAIM functionality
        console.log("\n=== Processing CLAIM for FST tokens ===");
        
        // Fake the metadata date as 10 minutes ago
        const currentTime = new Date();
        const fakeMetadataDate = new Date(currentTime.getTime() - 10 * 60 * 1000); // 10 minutes ago
        console.log(`Simulating mint date as: ${fakeMetadataDate.toISOString()}`);
        
        // Load the claims JSON file
        const fs = require('fs');
        let claimsData = {};
        try {
          if (fs.existsSync('./claims.json')) {
            const claimsFileContent = fs.readFileSync('./claims.json', 'utf8');
            claimsData = JSON.parse(claimsFileContent);
          }
        } catch (error) {
          console.log("Error loading claims data:", error.message);
          console.log("Creating new claims data file");
        }
        
        // Get the last claim time for this NFT or use the fake metadata date
        const lastClaimTime = claimsData[nftID] 
          ? new Date(claimsData[nftID]) 
          : fakeMetadataDate;
        
        console.log(`Last claim time: ${lastClaimTime.toISOString()}`);
        
        // Calculate seconds elapsed since last claim
        const secondsElapsed = Math.floor((currentTime.getTime() - lastClaimTime.getTime()) / 1000);
        console.log(`Seconds elapsed since last claim: ${secondsElapsed}`);
        
        // Calculate tokens to mint (1 FST per second)
        const tokensToMint = secondsElapsed;
        console.log(`Tokens to mint: ${tokensToMint} FST`);
        
        // Update the claim time to now
        claimsData[nftID] = currentTime.toISOString();
        
        // Save the updated claims data
        fs.writeFileSync('./claims.json', JSON.stringify(claimsData, null, 2));
        console.log("Updated claims data saved");
        
        // Configure issuer account settings (allow rippling, etc.)
        console.log("\nConfiguring issuer account settings...");
        const issuerSettings = {
          "TransactionType": "AccountSet",
          "Account": issuerWallet.address,
          "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple
        };
        
        const issuerSettingsTx = await client.submitAndWait(issuerSettings, {
          wallet: issuerWallet
        });
        console.log("Issuer account configured:", issuerSettingsTx.result.meta.TransactionResult);
        
        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a trustline from the main wallet to the issuer
        console.log("Creating trustline for FST token...");
        const trustSetTx = {
          "TransactionType": "TrustSet",
          "Account": wallet.address,
          "LimitAmount": {
            "currency": currency,
            "issuer": issuerWallet.address,
            "value": "1000000" // Set a high limit to accommodate claims
          }
        };
        
        const trustSetResult = await client.submitAndWait(trustSetTx, {
          wallet: wallet
        });
        console.log("Trustline created:", trustSetResult.result.meta.TransactionResult);
        
        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Issue initial 1000 FST tokens to the main wallet
        console.log("Issuing 1000 FST tokens to backend wallet...");
        const issueTx = {
          "TransactionType": "Payment",
          "Account": issuerWallet.address,
          "Destination": wallet.address,
          "Amount": {
            "currency": currency,
            "value": "1000",
            "issuer": issuerWallet.address
          }
        };
        
        const issueResult = await client.submitAndWait(issueTx, {
          wallet: issuerWallet
        });
        console.log("Issued 1000 FST tokens:", issueResult.result.meta.TransactionResult);
        
        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a trustline from the destination wallet to the issuer
        console.log("Creating trustline from destination wallet to token issuer...");
        const destTrustSetTx = {
          "TransactionType": "TrustSet",
          "Account": destinationWallet.address,
          "LimitAmount": {
            "currency": currency,
            "issuer": issuerWallet.address,
            "value": "1000000" // Set a high limit to accommodate claims
          }
        };
        
        const destTrustSetResult = await client.submitAndWait(destTrustSetTx, {
          wallet: destinationWallet
        });
        console.log("Destination trustline created:", destTrustSetResult.result.meta.TransactionResult);
        
        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mint the claimed tokens to the destination wallet
        console.log(`Minting ${tokensToMint} claimed FST tokens to destination wallet...`);
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
        console.log("Claimed tokens minted:", claimResult.result.meta.TransactionResult);
        
        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the destination received the tokens
        console.log("Verifying destination received the tokens...");
        const destAccountLines = await client.request({
          command: "account_lines",
          account: destinationWallet.address,
          ledger_index: "validated"
        });
        
        console.log("Destination token balances:");
        destAccountLines.result.lines.forEach(line => {
          if (line.currency === currency && line.account === issuerWallet.address) {
            console.log(`${line.currency}: ${line.balance}`);
          }
        });
        
      } else {
        console.log("NFT not found in destination wallet. Stopping process.");
        return; // Exit the function early
      }
      
      // Get and display final balances
      console.log("\nRetrieving final wallet balances...");
      const accountInfo = await client.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated"
      });
      
      const accountLines = await client.request({
        command: "account_lines",
        account: wallet.address,
        ledger_index: "validated"
      });
      
      console.log("\n=== Final wallet balances ===");
      console.log(`XRP: ${xrpl.dropsToXrp(accountInfo.result.account_data.Balance)} XRP`);
      console.log("Tokens:");
      accountLines.result.lines.forEach(line => {
        console.log(`${line.currency}: ${line.balance}`);
      });
      
      // Save wallet info to a file for future reference
      console.log("\n=== Wallet Information (SAVE THIS) ===");
      console.log("Backend Wallet Address:", wallet.address);
      console.log("Backend Wallet Seed:", wallet.seed);
      console.log("Issuer Wallet Address:", issuerWallet.address);
      console.log("Issuer Wallet Seed:", issuerWallet.seed);
      console.log("Destination Wallet Address:", destinationWallet ? destinationWallet.address : "Invalid seed");
      console.log("Destination Wallet Seed:", destinationSeed);
      
      // Save to a JSON file as well
      const fs = require('fs');
      const walletInfo = {
        backend: {
          address: wallet.address,
          seed: wallet.seed
        },
        issuer: {
          address: issuerWallet.address,
          seed: issuerWallet.seed
        },
        destination: destinationWallet ? {
          address: destinationWallet.address,
          seed: destinationSeed
        } : {
          error: "Invalid seed",
          seed: destinationSeed
        }
      };
      
      fs.writeFileSync('./wallet-info.json', JSON.stringify(walletInfo, null, 2));
      console.log("Wallet information saved to wallet-info.json");
      
    } catch (error) {
      console.error("Error with destination wallet:", error.message);
      console.log("The provided string may be incomplete or not a valid XRPL seed");
    }
    
    // Wait a moment before proceeding
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Disconnect from the XRPL
    await client.disconnect();
    console.log("Disconnected from XRPL");
  }
}

// Function to try alternative NFT data sources
async function tryAlternativeNFTDataSources(nftID, accountAddress) {
  console.log("\n=== Trying alternative sources for NFT metadata ===");
  
  // Try multiple NFT explorers and APIs
  const sources = [
    {
      name: "XRPL NFT Explorer API",
      url: `https://api.xrpldata.com/api/v1/xls20-nfts/nft/${nftID}`,
      process: async (data) => {
        console.log("NFT Metadata from XRPL NFT Explorer:");
        console.log(JSON.stringify(data, null, 2));
      }
    },
    {
      name: "Bithomp NFT API",
      url: `https://bithomp.com/api/v2/nft/${nftID}`,
      process: async (data) => {
        console.log("NFT Metadata from Bithomp:");
        console.log(JSON.stringify(data, null, 2));
      }
    },
    {
      name: "OnXRP NFT API",
      url: `https://api.onxrp.com/api/nfts/${nftID}`,
      process: async (data) => {
        console.log("NFT Metadata from OnXRP:");
        console.log(JSON.stringify(data, null, 2));
      }
    },
    {
      name: "XRPSCAN NFT API",
      url: `https://api.xrpscan.com/api/v1/account/${accountAddress}/nfts`,
      process: async (data) => {
        const nft = data.find(n => n.NFTokenID === nftID);
        if (nft) {
          console.log("NFT Metadata from XRPSCAN:");
          console.log(JSON.stringify(nft, null, 2));
        } else {
          console.log("NFT not found in XRPSCAN data");
        }
      }
    }
  ];
  
  let foundMetadata = false;
  
  for (const source of sources) {
    try {
      console.log(`Trying ${source.name}...`);
      const response = await fetch(source.url);
      
      if (response.ok) {
        const data = await response.json();
        await source.process(data);
        foundMetadata = true;
        break;
      } else {
        console.log(`Failed with ${source.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Error with ${source.name}: ${error.message}`);
    }
  }
  
  if (!foundMetadata) {
    console.log("\nCould not retrieve NFT metadata from any source.");
    console.log("Basic NFT information from XRPL:");
    console.log(`NFT ID: ${nftID}`);
    console.log(`Issuer: ${accountAddress}`);
    console.log("Taxon: 1337");
  }
}

// Execute the main function
main().catch(console.error);
