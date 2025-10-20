import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Tag, Calendar, Users, Percent } from "lucide-react";
import type { Coupon, InsertCoupon } from "@shared/schema";

export default function AdminCoupons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState<InsertCoupon>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: null,
    usageLimit: null,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const response = await fetch("/api/admin/coupons", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json() as Promise<Coupon[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCoupon) => {
      console.log("Sending coupon data:", data);
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to create coupon");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Coupon created successfully" });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Failed to create coupon", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCoupon> }) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update coupon");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Coupon updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update coupon", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast({ title: "Coupon deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete coupon", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minimumOrderAmount: 0,
      maximumDiscountAmount: null,
      usageLimit: null,
      isActive: true,
      validFrom: new Date(),
      validUntil: null,
    });
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure proper data formatting - send as ISO strings for JSON serialization
    const submitData = {
      ...formData,
      validFrom: formData.validFrom instanceof Date ? formData.validFrom.toISOString() : new Date(formData.validFrom).toISOString(),
      validUntil: formData.validUntil ? (formData.validUntil instanceof Date ? formData.validUntil.toISOString() : new Date(formData.validUntil).toISOString()) : null,
      minimumOrderAmount: formData.minimumOrderAmount || 0,
      maximumDiscountAmount: formData.maximumDiscountAmount || null,
      usageLimit: formData.usageLimit || null,
    };
    
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount || 0,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
      validFrom: new Date(coupon.validFrom),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil) : null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
    
    if (validFrom > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (validUntil && validUntil < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
            <p className="text-muted-foreground">Manage discount coupons and promotional offers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => setFormData({ ...formData, discountType: value as "percentage" | "fixed" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Get 20% off on all orders"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step={formData.discountType === "percentage" ? "1" : "0.01"}
                      max={formData.discountType === "percentage" ? "100" : undefined}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderAmount">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minimumOrderAmount"
                      type="number"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maximumDiscountAmount">Maximum Discount Amount (₹)</Label>
                    <Input
                      id="maximumDiscountAmount"
                      type="number"
                      value={formData.maximumDiscountAmount || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      usageLimit: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="datetime-local"
                      value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().slice(0, 16) : formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="datetime-local"
                      value={formData.validUntil ? (formData.validUntil instanceof Date ? formData.validUntil.toISOString().slice(0, 16) : formData.validUntil) : ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        validUntil: e.target.value ? new Date(e.target.value) : null 
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingCoupon ? "Update" : "Create"} Coupon
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.length === 0 ? (
              <Card className="p-8 text-center">
                <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first coupon to start offering discounts to customers.
                </p>
              </Card>
            ) : (
              coupons.map((coupon) => (
                <Card key={coupon.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-mono">{coupon.code}</h3>
                        {getStatusBadge(coupon)}
                      </div>
                      <p className="text-muted-foreground">{coupon.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(coupon.validFrom)} - {coupon.validUntil ? formatDate(coupon.validUntil) : "No expiry"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {coupon.usedCount}/{coupon.usageLimit || "∞"} used
                        </div>
                      </div>
                      {coupon.minimumOrderAmount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Minimum order: ₹{coupon.minimumOrderAmount}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}