import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@shared/schema";
import { getImageUrl } from "@/lib/utils/image";

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    return null;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted" data-testid="hero-carousel">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner, index) => (
          <div 
            key={banner.id} 
            className="min-w-full h-full relative"
            data-testid={`carousel-slide-${index}`}
          >
            <img
              src={getImageUrl(banner.image)}
              alt={banner.title || "Banner"}
              className="w-full h-full object-cover"
            />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
                  {banner.title && (
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3" data-testid="text-banner-title">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl" data-testid="text-banner-subtitle">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeBanners.length > 1 && (
        <>
          <Button
            size="icon"
            variant="outline"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={goToPrevious}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={goToNext}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
                data-testid={`button-carousel-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
