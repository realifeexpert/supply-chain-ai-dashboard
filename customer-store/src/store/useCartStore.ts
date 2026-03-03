import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  syncPrices: (latestProducts: Product[]) => void; // New: Action to sync data
  removeItem: (productId: number) => void;
  deleteProduct: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // SYNC LOGIC: Updates persisted items with fresh data from the API
      syncPrices: (latestProducts) => {
        const currentItems = get().items;
        if (currentItems.length === 0) return;

        const updatedItems = currentItems.map((item) => {
          // Find the matching product in the fresh data array
          const latestProduct = latestProducts.find((p) => p.id === item.id);

          if (latestProduct) {
            return {
              ...item,
              // Update all dynamic fields while keeping the cart quantity
              name: latestProduct.name,
              selling_price: latestProduct.selling_price,
              stock_quantity: latestProduct.stock_quantity,
              images: latestProduct.images,
              sku: latestProduct.sku,
              // Add other fields like gst_rate if they exist in your type
              gst_rate: (latestProduct as any).gst_rate || 0,
            };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (product.stock_quantity <= 0) return;

        if (existingItem) {
          if (existingItem.quantity >= product.stock_quantity) return;
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === productId);
        if (!existingItem) return;

        if (existingItem.quantity > 1) {
          set({
            items: items.map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            ),
          });
        } else {
          set({ items: items.filter((item) => item.id !== productId) });
        }
      },

      deleteProduct: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === productId);
        if (!existingItem) return;

        if (quantity <= 0) {
          set({ items: items.filter((item) => item.id !== productId) });
          return;
        }

        const safeQty = Math.min(quantity, existingItem.stock_quantity);
        set({
          items: items.map((item) =>
            item.id === productId ? { ...item, quantity: safeQty } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.selling_price * item.quantity,
          0,
        ),
    }),
    {
      name: "shopping-cart",
      // Optional: Ensure drawer state isn't persisted if you add it later
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
