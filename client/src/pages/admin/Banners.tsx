import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Banner } from "@shared/schema";

export default function AdminBanners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/banners/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner deleted successfully" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (bannerIds: string[]) => {
      return await apiRequest("POST", "/api/banners/reorder", { bannerIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
    },
  });

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    deleteMutation.mutate(id);
  };

  const handleMoveUp = (banner: Banner) => {
    const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
    const index = sortedBanners.findIndex(b => b.id === banner.id);
    if (index <= 0) return;
    
    const newOrder = [...sortedBanners];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderMutation.mutate(newOrder.map(b => b.id));
  };

  const handleMoveDown = (banner: Banner) => {
    const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
    const index = sortedBanners.findIndex(b => b.id === banner.id);
    if (index >= sortedBanners.length - 1) return;
    
    const newOrder = [...sortedBanners];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(newOrder.map(b => b.id));
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-page-title">
            Hero Banners
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBanner(null)} data-testid="button-add-banner">
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
              </DialogHeader>
              <BannerForm banner={editingBanner} onClose={() => { setIsDialogOpen(false); setEditingBanner(null); }} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : banners.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No banners yet. Add your first banner!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {banners.sort((a, b) => a.order - b.order).map((banner, index) => (
              <Card key={banner.id} className="p-4" data-testid={`banner-card-${banner.id}`}>
                <div className="flex gap-4">
                  <img src={banner.image} alt={banner.title || "Banner"} className="w-32 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{banner.title || "Untitled Banner"}</h3>
                        {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                      </div>
                      {banner.isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => handleMoveUp(banner)} disabled={index === 0} data-testid={`button-move-up-${banner.id}`}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleMoveDown(banner)} disabled={index === banners.length - 1} data-testid={`button-move-down-${banner.id}`}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(banner)} data-testid={`button-edit-${banner.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(banner.id)} data-testid={`button-delete-${banner.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

function BannerForm({ banner, onClose }: { banner: Banner | null; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    isActive: banner?.isActive ?? true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/banners", {
        ...data,
        image: "/attached_assets/generated_images/Traditional_kitchen_banner_image_f751e656.png",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner created successfully" });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", `/api/banners/${banner!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner updated successfully" });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (banner) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          data-testid="input-banner-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          data-testid="input-banner-subtitle"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
          data-testid="input-banner-active"
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" data-testid="button-save-banner">
          {banner ? "Update" : "Create"} Banner
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
