import { fetchNFTInfo, fetchNFTs } from "@/functions/gemwallet";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface NFTData {
  land_id: string;
  gps: string;
  ref_cad: string;
  surface: number;
  owner: string;
  platform: string;
  mint_date: string;
  contract_uri?: string;
}

interface NftsState {
  nfts: NFTData[];
  nftsIds: string[];

  // Actions
  addNftId: (nftId: string) => void;
  addNft: (nft: NFTData) => void;
  removeNft: (land_id: string) => void;
  updateNft: (land_id: string, nft: NFTData) => void;
  getRemoteNft: (land_id: string) => void;
  getAllRemotesNfts: () => void;
}

export const useNftsStore = create<NftsState>()(
  devtools((set) => ({
    nfts: [],

    addNft: (nft: NFTData) =>
      set((state) => ({
        nfts: [...state.nfts, nft],
      })),

    removeNft: (land_id: string) =>
      set((state) => ({
        nfts: state.nfts.filter((nft) => nft.land_id !== land_id),
      })),

    updateNft: (land_id: string, updatedNft: NFTData) =>
      set((state) => ({
        nfts: state.nfts.map((nft) => (nft.land_id === land_id ? updatedNft : nft)),
      })),

    getRemoteNft: async (land_id: string) => {
      const nft = await fetchNFTInfo(land_id);
      set((state) => ({
        nfts: [...state.nfts, nft],
      }));
    },

    getAllRemotesNfts: async () => {
      const nfts = await fetchNFTs();
      console.log("🚀 ~ getAllRemotesNfts: ~ nfts:", nfts);
      set({ nfts });
    },
  }))
);
