import React, { useEffect, useState } from "react";
import { getStorefrontProducts } from "@/services/api";
import { ProductCard } from "@/components/product/ProductCard";
import { Navbar } from "@/components/common/Navbar";
import { useInventorySocket } from "@/hooks/useInventorySocket";
import { useCartStore } from "@/store/useCartStore"; // 1. Import the store

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Get the syncPrices action from your store
  const syncPrices = useCartStore((state) => state.syncPrices);

  const fetchProducts = async () => {
    try {
      const response = await getStorefrontProducts();
      const latestData = response.data;

      setProducts(latestData); // Updates the UI Grid

      // 3. 🔥 REAL-TIME SYNC: Update the CartDrawer and Persisted Prices
      // This ensures that if the admin changed the price from 3500 to 3700,
      // the items already in the user's cart get the new price instantly.
      syncPrices(latestData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // This hook listens to your Socket.io/WebSocket server
  // When an admin updates ANY product, it triggers fetchProducts()
  useInventorySocket(fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">
      <Navbar />

      <main className="flex-1 overflow-y-auto custom-scrollbar pt-16 pb-24 md:pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[60vh]">
              <div className="h-10 w-10 border-4 border-muted border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px]">
                Syncing_Inventory
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
              {products.map((product: any) => (
                <div key={product.id} className="flex justify-center">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 opacity-30">
              <div className="h-20 w-20 border-2 border-dashed border-border rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-muted-foreground">
                  ∅
                </span>
              </div>
              <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-sm">
                No_Products_Found
              </p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--ring));
        }
        main {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--border)) transparent;
        }
      `}</style>
    </div>
  );
};
