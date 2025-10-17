import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.regularPrice && product.regularPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.regularPrice! - product.price) / product.regularPrice!) * 100)
    : 0;

  const isOutOfStock = product.inventory === 0;

  return (
    <Card className="overflow-hidden group hover-elevate transition-all" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${product.id}`}
          />
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-3 right-3 rounded-full"
              data-testid={`badge-discount-${product.id}`}
            >
              {discountPercent}% OFF
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-base px-4 py-2">
                Sold Out
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
            ₹{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="font-mono text-sm text-muted-foreground line-through" data-testid={`text-regular-price-${product.id}`}>
              ₹{product.regularPrice!.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          className="w-full"
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Sold Out" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
}
