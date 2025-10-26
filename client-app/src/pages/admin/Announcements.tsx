import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, InsertAnnouncement } from "@shared/schema";

export default function Announcements() {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const response = await fetch(`${window.location.origin}/api/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setDialogOpen(false);
      toast({ title: "Success", description: "Announcement created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAnnouncement> }) => {
      const response = await fetch(`${window.location.origin}/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setDialogOpen(false);
      setEditingAnnouncement(null);
      toast({ title: "Success", description: "Announcement updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${window.location.origin}/api/admin/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete announcement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Success", description: "Announcement deleted successfully" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (announcementIds: string[]) => {
      const response = await fetch(`${window.location.origin}/api/admin/announcements/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ announcementIds }),
      });
      if (!response.ok) throw new Error("Failed to reorder announcements");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...announcements];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    reorderMutation.mutate(newOrder.map(a => a.id));
  };

  const moveDown = (index: number) => {
    if (index === announcements.length - 1) return;
    const newOrder = [...announcements];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(newOrder.map(a => a.id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground mt-2">
              Manage ribbon announcements shown above the header
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAnnouncement(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
                </DialogTitle>
              </DialogHeader>
              <AnnouncementForm
                announcement={editingAnnouncement}
                onClose={handleCloseDialog}
                onCreate={createMutation.mutate}
                onUpdate={updateMutation.mutate}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : announcements.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No announcements yet. Add your first announcement!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <Card key={announcement.id} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveDown(index)}
                      disabled={index === announcements.length - 1}
                      className="h-6 w-6"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div
                    className="flex-1 py-2 px-4 text-center text-sm font-medium rounded"
                    style={{
                      backgroundColor: announcement.backgroundColor || "#000000",
                      color: announcement.textColor || "#ffffff",
                    }}
                  >
                    {announcement.text}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {announcement.isActive ? "Active" : "Inactive"}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement.id)}>
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

interface AnnouncementFormProps {
  announcement: Announcement | null;
  onClose: () => void;
  onCreate: (data: InsertAnnouncement) => void;
  onUpdate: (params: { id: string; data: Partial<InsertAnnouncement> }) => void;
}

function AnnouncementForm({ announcement, onClose, onCreate, onUpdate }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    text: announcement?.text || "",
    backgroundColor: announcement?.backgroundColor || "#000000",
    textColor: announcement?.textColor || "#ffffff",
    isActive: announcement?.isActive ?? true,
    order: announcement?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcement) {
      onUpdate({ id: announcement.id, data: formData });
    } else {
      onCreate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Announcement Text</Label>
        <Input
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Free Shipping on Prepaid Orders"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              type="color"
              value={formData.backgroundColor || "#000000"}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={formData.backgroundColor || "#000000"}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textColor">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              type="color"
              value={formData.textColor || "#ffffff"}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={formData.textColor || "#ffffff"}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
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

      <div
        className="p-4 text-center rounded text-sm font-medium"
        style={{
          backgroundColor: formData.backgroundColor || "#000000",
          color: formData.textColor || "#ffffff",
        }}
      >
        Preview: {formData.text || "Your announcement text here"}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {announcement ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
