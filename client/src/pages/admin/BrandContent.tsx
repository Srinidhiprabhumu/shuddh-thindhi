import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BrandContent } from "@shared/schema";

export default function AdminBrandContent() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const { data: brandContent = {} } = useQuery<Record<string, BrandContent>>({
    queryKey: ["/api/brand-content"],
  });

  const sections = [
    { key: "mission", label: "Mission Statement" },
    { key: "story", label: "Our Story" },
    { key: "values", label: "Our Values" },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8" data-testid="text-page-title">
          Brand Content
        </h1>

        <div className="space-y-6">
          {sections.map((section) => {
            const content = brandContent[section.key];
            const isEditing = editingSection === section.key;

            return (
              <Card key={section.key} className="p-6" data-testid={`section-card-${section.key}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-2xl font-semibold">{section.label}</h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(section.key)}
                      data-testid={`button-edit-${section.key}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <ContentForm
                    section={section.key}
                    content={content}
                    onClose={() => setEditingSection(null)}
                  />
                ) : content ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{content.content}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No content yet. Click edit to add content.</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

function ContentForm({ section, content, onClose }: { section: string; content?: BrandContent; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: content?.title || "",
    content: content?.content || "",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/brand-content", {
        section,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-content"] });
      toast({ title: "Content saved successfully" });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          data-testid="input-content-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={10}
          data-testid="input-content-body"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" data-testid="button-save-content">Save</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
