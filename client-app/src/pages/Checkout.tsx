import { useState, useEffect } from "react";
import { Header } from "@/components/Storefront/Header";
import { Footer } from "@/components/Storefront/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CouponInput } from "@/components/CouponInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useOrderUpdates } from "@/hooks/useOrderUpdates";
import { getImageUrl } from "@/lib/utils/image";
import type { Coupon } from "@shared/schema";

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { triggerOrderUpdate } = useOrderUpdates();
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerPhone: "",
    shippingAddress: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  // Update customer name when user changes
  useEffect(() => {
    if (user?.name && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: user.name }));
    }
  }, [user?.name, formData.customerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerPhone.trim()) {
      toast({
        title: "Error", 
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.shippingAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter your shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    if (!user) return;

    setLoading(true);
    setShowConfirmation(false);
    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: user.email,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        items: JSON.stringify(items),
        totalAmount: total,
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
      };

      const response = await fetch(`${window.location.origin}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create order' }));
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await response.json();
      
      // Apply coupon usage if one was used
      if (appliedCoupon) {
        await fetch(`${window.location.origin}/api/coupons/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCoupon.code }),
        });
      }
      
      clearCart();
      setAppliedCoupon(null);
      setDiscount(0);
      
      // Invalidate orders query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      // Trigger order update notification
      triggerOrderUpdate('ORDER_CREATED', { orderId: order.id });
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id} has been created. You can track it in My Orders.`,
      });
      setLocation("/my-orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">
              Checkout
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="font-serif text-2xl font-semibold mb-6">
                  Shipping Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingAddress: e.target.value })
                      }
                      required
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Processing..." : "Review Order"}
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <h2 className="font-serif text-2xl font-semibold mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-mono">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Apply Coupon</h3>
                      <CouponInput
                        orderAmount={subtotal}
                        onCouponApplied={(coupon, discountAmount) => {
                          setAppliedCoupon(coupon);
                          setDiscount(discountAmount);
                        }}
                        onCouponRemoved={() => {
                          setAppliedCoupon(null);
                          setDiscount(0);
                        }}
                        appliedCoupon={appliedCoupon || undefined}
                        appliedDiscount={discount}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon?.code}):</span>
                          <span className="font-mono">-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span className="font-mono">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-chart-3">
                      Free shipping on prepaid orders
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer onSubscribe={handleSubscribe} />
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={(open) => !loading && setShowConfirmation(open)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Confirm Your Order</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {formData.customerName}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Phone:</strong> {formData.customerPhone}</div>
                <div><strong>Address:</strong> {formData.shippingAddress}</div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code}):</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t pt-2 text-primary">
                  <span>Total:</span>
                  <span className="font-mono">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Free shipping on prepaid orders
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
                disabled={loading}
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleConfirmOrder}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Confirm & Place Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}