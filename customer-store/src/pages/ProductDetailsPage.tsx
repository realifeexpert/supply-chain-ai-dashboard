import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Hash,
  ArrowLeft,
  Zap,
  Minus,
  Plus,
} from "lucide-react";
import { getProductDetails } from "@/services/api";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/types/index";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0, // Hides .00
    maximumFractionDigits: 2,
  }).format(amount);

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await getProductDetails(Number(id));
          setProduct(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) addItem(product);
      navigate("/checkout");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        <div className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
          Loading Product Details...
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl mb-4 font-bold text-foreground">
          Product not found.
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-muted px-6 py-2 rounded-full hover:bg-muted/80 transition-colors text-sm"
        >
          Return Home
        </button>
      </div>
    );

  const stock = product.stock_quantity;
  const isOut = stock <= 0;
  const images = product.images || [];
  const gstRate = (product as any).gst_rate || 0;
  const sellingPrice = product.selling_price || 0;
  const taxablePrice = sellingPrice / (1 + gstRate / 100);
  const gstAmount = sellingPrice - taxablePrice;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hide scrollbars globally for this component */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-10 py-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* LEFT: IMAGE GALLERY */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden flex items-center justify-center p-6 sm:p-12">
              <img
                src={
                  images[selectedImageIndex]?.media_url || "/placeholder.png"
                }
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
              />
              {isOut && (
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <span className="bg-destructive text-destructive-foreground px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="no-scrollbar flex gap-3 overflow-x-auto py-2 justify-center lg:justify-start">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 rounded-xl border-2 transition-all duration-200 overflow-hidden bg-muted/10 ${
                      selectedImageIndex === idx
                        ? "border-yellow-500 ring-4 ring-yellow-500/10"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.media_url}
                      alt="thumb"
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="flex flex-col">
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 border border-border/50">
                  <Hash size={12} /> {product.sku}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isOut ? "text-red-500" : "text-green-500"}`}
                >
                  <Package size={14} />
                  {isOut ? "Out of Stock" : `In Stock (${stock} available)`}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                {product.name}
              </h1>
            </div>

            {/* PRICING CARD */}
            <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-[2rem] shadow-sm mb-8">
              <div className="text-4xl sm:text-5xl font-black text-yellow-500 italic tracking-tighter">
                {formatCurrency(sellingPrice)}
              </div>

              <div className="mt-6 pt-6 border-t border-border/40 space-y-2">
                <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold text-muted-foreground/80">
                  <span>Taxable Amount</span>
                  <span className="text-foreground">
                    {formatCurrency(taxablePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold text-muted-foreground/80">
                  <span>GST Amount ({gstRate}%)</span>
                  <span className="text-foreground">
                    {formatCurrency(gstAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {!isOut && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-2xl p-1 bg-muted/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-background rounded-xl transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-background rounded-xl transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      for (let i = 0; i < quantity; i++) addItem(product);
                    }}
                    className="h-16 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="h-16 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    <Zap size={20} /> Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* CLEAN DESCRIPTION */}
            <div className="mt-12 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Description
              </h3>
              <div className="max-w-none prose prose-sm">
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg font-medium">
                  {product.description ||
                    "No detailed description available for this premium item."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
