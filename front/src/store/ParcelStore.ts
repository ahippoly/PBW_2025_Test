import allParcels from "@/data/allParcels";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Remove the import and use the global type directly

interface ParcelState {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  parcelIndex: number;
  loading: boolean;
  error: string | null;

  // Actions
  setParcels: (parcels: Parcel[]) => void;
  addParcel: (parcel: Parcel) => void;
  updateParcel: (parcel: Parcel) => void;
  deleteParcel: (id: string) => void;
  selectParcel: (id: string | null) => void;
  setParcelIndex: (index: number) => void;
  incrementParcelIndex: () => void;
  decrementParcelIndex: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useParcelStore = create<ParcelState>()(
  devtools(
    (set, get) => ({
      parcels: allParcels,
      selectedParcel: null,
      parcelIndex: 0,
      loading: false,
      error: null,

      setParcels: (parcels) => set({ parcels }),

      addParcel: (parcel) =>
        set((state) => ({
          parcels: [...state.parcels, parcel],
        })),

      updateParcel: (updatedParcel) =>
        set((state) => ({
          parcels: state.parcels.map((parcel) => (parcel.id === updatedParcel.id ? updatedParcel : parcel)),
          selectedParcel: state.selectedParcel?.id === updatedParcel.id ? updatedParcel : state.selectedParcel,
        })),

      deleteParcel: (id) =>
        set((state) => ({
          parcels: state.parcels.filter((parcel) => parcel.id !== id),
          selectedParcel: state.selectedParcel?.id === id ? null : state.selectedParcel,
        })),

      selectParcel: (id) =>
        set((state) => ({
          selectedParcel: id ? state.parcels.find((parcel) => parcel.id === id) || null : null,
        })),

      setParcelIndex: (index) => set({ parcelIndex: index }),

      incrementParcelIndex: () =>
        set((state) => {
          const nextIndex = state.parcelIndex + 1;
          return {
            parcelIndex: nextIndex < state.parcels.length ? nextIndex : state.parcelIndex,
          };
        }),

      decrementParcelIndex: () =>
        set((state) => ({
          parcelIndex: state.parcelIndex > 0 ? state.parcelIndex - 1 : 0,
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),
    }),
    { name: "parcel-store" }
  )
);
