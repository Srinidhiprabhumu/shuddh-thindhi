import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface ReviewFormData {
  customerName: string;
  customerEmail: string;
  rating: number;
  reviewText: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    customerName: "",
    customerEmail: "",
    rating: 5,
    reviewText: "",
  });
  const { toast } = useToast();

  // Fetch product reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewFormData) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewData,
          productId,
        }),
      });
      if (!response.ok) throw new Error("Failed to create review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      toast({ title: "Review submitted successfully! It will be visible after approval." });
      setIsDialogOpen(false);
      setFormData({
        customerName: "",
        customerEmail: "",
        rating: 5,
        reviewText: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.reviewText.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createReviewMutation.mutate(formData);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const approvedReviews = reviews.filter(r => r.isApproved);
  const averageRating = approvedReviews.length > 0 
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          {approvedReviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-muted-foreground">
                ({averageRating.toFixed(1)}) • {approvedReviews.length} review{approvedReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Add Review Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Write a Review for {productName}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Rating *</Label>
                <div className="mt-2">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="reviewText">Review *</Label>
                <Textarea
                  id="reviewText"
                  value={formData.reviewText}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createReviewMutation.isPending} className="flex-1">
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews List */}
      {approvedReviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvedReviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{review.customerName}</h4>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">Verified</Badge>
              </div>
              {review.reviewText && (
                <p className="text-sm leading-relaxed">{review.reviewText}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}