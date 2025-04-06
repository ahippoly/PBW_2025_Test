import xrpl, { NFTBuyOffersRequest, NFTokenAcceptOffer, NFTokenCreateOffer } from 'xrpl'

export interface LandMetadata {
    land_id: string
    gps: string
    ref_cad: string
    surface: number
    owner: string
    platform: string,
    mint_date: string
    contract_uri?: string
  }

  export async function getNFTInfo(nftID: string, attempt = 1): Promise<any> {
    const MAX_ATTEMPTS = 5;
    const RETRY_BASE_DELAY_MS = 2000;
  
    try {
      console.log(`🔍 [Tentative ${attempt}] Récupération des infos NFT ${nftID} via Clio...`);
  
      const clioResponse = await fetch('https://clio.altnet.rippletest.net:51234', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'nft_info',
          params: [
            {
              nft_id: nftID,
              ledger_index: 'validated',
            },
          ],
        }),
      });
  
      type ClioResponse = {
        result?: {
          uri?: string;
          [key: string]: unknown;
        };
        error?: string;
        [key: string]: unknown;
      };
  
      const data: ClioResponse = await clioResponse.json();
  
      console.log('📦 Réponse Clio:\n', JSON.stringify(data, null, 2));
  
      if (data.error === 'slowDown') {
        if (attempt < MAX_ATTEMPTS) {
          const delayTime = RETRY_BASE_DELAY_MS * attempt;
          console.warn(`⚠️ Clio dit "slowDown" → retry dans ${delayTime / 1000}s...`);
          await delay(delayTime);
          return getNFTInfo(nftID, attempt + 1);
        } else {
          console.error('❌ Trop de tentatives, abandon.');
          return undefined;
        }
      }
  
      if (data.result) {
        
        return data.result;
      } else {
        console.warn('❌ URI non trouvée dans la réponse.');
        return undefined;
      }
  
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des infos NFT :', error.message || error);
      return undefined;
    }
  }


export function extractNFTokenID(meta: any): string | undefined {
  const affectedNodes = meta.AffectedNodes

  for (const node of affectedNodes) {
    const created = node.CreatedNode
    if (
      created?.LedgerEntryType === 'NFTokenPage' &&
      created.NewFields?.NFTokens?.length
    ) {
      return created.NewFields.NFTokens[0].NFToken.NFTokenID
    }
  }

  for (const node of affectedNodes) {
    const modified = node.ModifiedNode
    if (
      modified?.LedgerEntryType === 'NFTokenPage' &&
      modified.FinalFields?.NFTokens?.length
    ) {
      const last = modified.FinalFields.NFTokens.at(-1)
      return last?.NFToken?.NFTokenID
    }
  }

  return undefined
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getSellInformation(nft_id : string, client: xrpl.Client): Promise<any> {
    try {
        const res = await client.request({
          command: "nft_sell_offers",
          nft_id
        })
        console.log("📦 Réponse Clio:\n", JSON.stringify(res, null, 2))
    
        const offers = res.result.offers
        if (!offers || offers.length === 0) {
          return {
            forSale: false,
            price: null,
            owner: null
          }
        }
    
        const offer = offers[0]
    
        return {
          forSale: true,
          price: offer.amount,
          owner: offer.owner,
          
        }
    
    } catch (error) {
    
    return {
        forSale: false,
        price: null,
        owner: null
        }
    }
    
}

