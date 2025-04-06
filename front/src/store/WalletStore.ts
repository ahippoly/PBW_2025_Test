import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { connectGemWallet } from "../functions/gemwallet";
import { getAddress } from "@gemwallet/api";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setAddress: (address: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,

      connectWallet: async () => {
        try {
          set({ isConnecting: true, error: null });
          const address = await connectGemWallet();

          if (address) {
            set({
              address,
              isConnected: true,
              isConnecting: false,
            });
          } else {
            set({
              isConnecting: false,
              error: "Failed to connect wallet",
            });
          }
        } catch (error) {
          console.error("Error connecting wallet:", error);
          set({
            isConnecting: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      },

      disconnectWallet: () => {
        set({
          address: null,
          isConnected: false,
        });
      },

      setAddress: (address) =>
        set({
          address,
          isConnected: !!address,
        }),

      setIsConnecting: (isConnecting) => set({ isConnecting }),

      setError: (error) => set({ error }),
    }),
    { name: "wallet-store" }
  )
);
