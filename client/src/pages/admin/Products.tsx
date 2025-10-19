import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/products/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/featured"] });
      toast({ title: "Product deleted successfully" });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    deleteMutation.mutate(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-page-title">
            Products
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)} data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>
              <ProductForm product={editingProduct} onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No products yet. Add your first product!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
                <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover" />
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-primary">₹{product.price}</span>
                    {product.regularPrice && (
                      <span className="font-mono text-sm text-muted-foreground line-through">₹{product.regularPrice}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Stock: {product.inventory}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(product)} data-testid={`button-edit-${product.id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} data-testid={`button-delete-${product.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    regularPrice: product?.regularPrice || 0,
    category: product?.category || "",
    inventory: product?.inventory || 0,
    isFeatured: product?.isFeatured || false,
    images: product?.images || ["/attached_assets/generated_images/Traditional_thekua_sweet_snacks_abfa8650.png"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/featured"] });
      toast({ title: "Product created successfully" });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", `/api/admin/products/${product!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/featured"] });
      toast({ title: "Product updated successfully" });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-product-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
          data-testid="input-product-description"
        />
      </div>

      <ImageUpload
        value={formData.images}
        onChange={(images) => setFormData({ ...formData, images })}
        maxImages={5}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Sale Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            data-testid="input-product-price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="regularPrice">Regular Price</Label>
          <Input
            id="regularPrice"
            type="number"
            step="0.01"
            value={formData.regularPrice}
            onChange={(e) => setFormData({ ...formData, regularPrice: parseFloat(e.target.value) })}
            data-testid="input-product-regular-price"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            data-testid="input-product-category"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventory">Inventory</Label>
          <Input
            id="inventory"
            type="number"
            value={formData.inventory}
            onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
            required
            data-testid="input-product-inventory"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          className="rounded"
          data-testid="input-product-featured"
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" data-testid="button-save-product">
          {product ? "Update" : "Create"} Product
        </Button>
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </form>
  );
}
