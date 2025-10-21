import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";
import { getImageUrl } from "@/lib/utils/image";

export default function AdminReviews() {
  const { toast } = useToast();
  
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/admin/reviews/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/approved"] });
      toast({ title: "Review approved successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/reviews/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/approved"] });
      toast({ title: "Review deleted successfully" });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8" data-testid="text-page-title">
          Customer Reviews
        </h1>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No reviews yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden" data-testid={`review-card-${review.id}`}>
                <img src={getImageUrl(review.image)} alt={`Review by ${review.customerName}`} className="w-full aspect-square object-cover" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{review.customerName}</h3>
                    {review.isApproved ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {!review.isApproved && (
                      <Button size="sm" className="flex-1" onClick={() => handleApprove(review.id)} data-testid={`button-approve-${review.id}`}>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)} data-testid={`button-delete-${review.id}`}>
                      <X className="h-4 w-4" />
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
