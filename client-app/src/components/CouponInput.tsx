import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tag, X, Check } from "lucide-react";
import type { Coupon } from "@shared/schema";

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (coupon: Coupon, discount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: Coupon;
  appliedDiscount?: number;
}

export function CouponInput({ 
  orderAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon, 
  appliedDiscount 
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const calculateDiscount = (coupon: Coupon, amount: number): number => {
    if (coupon.discountType === "percentage") {
      const discount = (amount * coupon.discountValue) / 100;
      return coupon.maximumDiscountAmount 
        ? Math.min(discount, coupon.maximumDiscountAmount)
        : discount;
    } else {
      return Math.min(coupon.discountValue, amount);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Invalid coupon",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch(`${window.location.origin}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount,
        }),
      });

      const result = await response.json();

      if (result.valid && result.coupon) {
        const discount = calculateDiscount(result.coupon, orderAmount);
        onCouponApplied(result.coupon, discount);
        setCouponCode("");
        toast({
          title: "Coupon applied!",
          description: `You saved ₹${discount.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: result.error || "This coupon is not valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="font-mono font-semibold text-green-800">
              {appliedCoupon.code}
            </span>
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              ₹{appliedDiscount?.toFixed(2)} off
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-green-600">{appliedCoupon.description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="pl-10"
            onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
          />
        </div>
        <Button
          onClick={handleApplyCoupon}
          disabled={isValidating || !couponCode.trim()}
          variant="outline"
        >
          {isValidating ? "Validating..." : "Apply"}
        </Button>
      </div>
    </div>
  );
}