import { useState } from "react";
import type { Review } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/utils/image";

interface ReviewsGalleryProps {
  reviews: Review[];
}

export function ReviewsGallery({ reviews }: ReviewsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Review | null>(null);
  const approvedReviews = reviews.filter(r => r.isApproved);

  if (approvedReviews.length === 0) {
    return null;
  }

  const displayReviews = approvedReviews;

  return (
    <div className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-reviews-heading">
          Customer Reviews
        </h2>

        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-scroll">
            {displayReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-48 md:w-64 aspect-square cursor-pointer hover-elevate rounded-lg overflow-hidden transition-all"
                onClick={() => setSelectedImage(review)}
                data-testid={`review-image-${index}`}
              >
                <img
                  src={getImageUrl(review.image)}
                  alt={`Review by ${review.customerName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle data-testid="text-review-customer-name">Review by {selectedImage?.customerName}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={getImageUrl(selectedImage.image)}
              alt={`Review by ${selectedImage.customerName}`}
              className="w-full rounded-lg"
              data-testid="img-review-full"
            />
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
