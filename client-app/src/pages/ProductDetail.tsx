import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/Storefront/Header";
import { Footer } from "@/components/Storefront/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { getImageUrl } from "@/lib/utils/image";
import { ProductReviews } from "@/components/ProductReviews";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, items } = useCartStore();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleSubscribe = async (email: string) => {
    const response = await fetch(`${window.location.origin}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const hasDiscount = product.regularPrice && product.regularPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.regularPrice! - product.price) / product.regularPrice!) * 100)
    : 0;
  const isOutOfStock = product.inventory === 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main"
                />
                {hasDiscount && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-4 right-4 rounded-full text-base px-4 py-2"
                  >
                    {discountPercent}% OFF
                  </Badge>
                )}
                {product.images.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                      onClick={prevImage}
                      data-testid="button-prev-image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                      onClick={nextImage}
                      data-testid="button-next-image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? "border-primary" : "border-transparent"
                      }`}
                      data-testid={`button-thumbnail-${index}`}
                    >
                      <img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-product-name">
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-lg" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold text-primary" data-testid="text-product-price">
                  ₹{product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="font-mono text-xl text-muted-foreground line-through" data-testid="text-product-regular-price">
                    ₹{product.regularPrice!.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Category: <span className="font-medium text-foreground">{product.category}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Availability: {isOutOfStock ? (
                    <Badge variant="secondary">Out of Stock</Badge>
                  ) : (
                    <span className="font-medium text-chart-3">{product.inventory} in stock</span>
                  )}
                </p>
              </div>

              <Button
                size="lg"
                className="w-full md:w-auto px-8"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Product Reviews Section */}
          <div className="mt-16 border-t pt-16">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        </div>
      </main>

      <Footer onSubscribe={handleSubscribe} />
    </div>
  );
}
