import { Header } from "@/components/Storefront/Header";
import { Footer } from "@/components/Storefront/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { getImageUrl } from "@/lib/utils/image";

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuth();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubscribe = async (email: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8" data-testid="text-page-title">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-serif text-2xl font-semibold mb-2" data-testid="text-empty-cart">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some delicious snacks to get started!
              </p>
              <Link href="/products">
                <Button data-testid="button-continue-shopping">Continue Shopping</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <Card key={item.productId} className="p-4 md:p-6" data-testid={`cart-item-${item.productId}`}>
                  <div className="flex gap-4">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg bg-muted flex-shrink-0"
                      data-testid={`img-cart-item-${item.productId}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2" data-testid={`text-cart-item-name-${item.productId}`}>
                        {item.name}
                      </h3>
                      <p className="font-mono text-xl font-bold text-primary mb-4" data-testid={`text-cart-item-price-${item.productId}`}>
                        ₹{item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            data-testid={`button-decrease-quantity-${item.productId}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-mono text-lg font-semibold w-12 text-center" data-testid={`text-quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            data-testid={`button-increase-quantity-${item.productId}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="font-mono text-xl font-bold" data-testid={`text-cart-item-total-${item.productId}`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="font-mono font-bold" data-testid="text-subtotal">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Shipping:</span>
                    <span className="text-chart-3 font-medium">FREE on prepaid orders</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center text-xl md:text-2xl">
                      <span className="font-serif font-bold">Total:</span>
                      <span className="font-mono font-bold text-primary" data-testid="text-total">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <Link href="/checkout">
                      <Button size="lg" className="w-full" data-testid="button-checkout">
                        Proceed to Checkout
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        Please sign in to proceed with checkout
                      </p>
                      <Link href="/login">
                        <Button size="lg" className="w-full" data-testid="button-signin-checkout">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign in to Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer onSubscribe={handleSubscribe} />
    </div>
  );
}
