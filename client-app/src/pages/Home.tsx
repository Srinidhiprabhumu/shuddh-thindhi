import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Storefront/Header";
import { HeroCarousel } from "@/components/Storefront/HeroCarousel";
import { ProductCard } from "@/components/Storefront/ProductCard";
import { ReviewsGallery } from "@/components/Storefront/ReviewsGallery";
import { Footer } from "@/components/Storefront/Footer";
import { Loader2, Leaf, Award, Heart, Users } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Product, Banner, Review, BrandContent } from "@shared/schema";

export default function Home() {
  const { addItem, items, clearCart } = useCartStore();
  const { refetchUser } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: banners = [], isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews/approved"],
  });

  const { data: brandContent = {} } = useQuery<Record<string, BrandContent>>({
    queryKey: ["/api/brand-content"],
  });

  const { toast } = useToast();

  // Handle OAuth login success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    
    if (loginSuccess === 'success') {
      console.log('OAuth login success detected, refreshing user data...');
      
      // Add a small delay to ensure session is fully established
      setTimeout(async () => {
        try {
          // First, check OAuth status
          const oauthResponse = await fetch(`${window.location.origin}/api/auth/oauth-status`, {
            credentials: 'include'
          });
          const oauthData = await oauthResponse.json();
          console.log('OAuth status check:', oauthData);
          
          // Then refresh user data
          await refetchUser();
          console.log('User data refreshed successfully');
          
          // Clear cart for fresh login
          clearCart();
          
          // Show success message
          toast({
            title: "Welcome back!",
            description: "You have been logged in with Google successfully.",
          });
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          
          // Try checking session test endpoint
          try {
            const sessionResponse = await fetch(`${window.location.origin}/api/test/session`, {
              credentials: 'include'
            });
            const sessionData = await sessionResponse.json();
            console.log('Session test data:', sessionData);
          } catch (sessionError) {
            console.error('Session test failed:', sessionError);
          }
          
          // Try one more time after another delay
          setTimeout(() => {
            refetchUser().catch(() => {
              console.error('Second attempt to refresh user data failed');
            });
          }, 1000);
          
          // Still show success message
          toast({
            title: "Welcome back!",
            description: "You have been logged in with Google successfully.",
          });
        }
      }, 1000); // Increased delay to 1000ms
      
      // Clean up URL by removing the login parameter
      setLocation('/');
    }
  }, [refetchUser, toast, setLocation]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleSubscribe = async (email: string) => {
    const response = await fetch(`${window.location.origin}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  const values = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We source ingredients responsibly and use eco-friendly packaging to minimize our environmental footprint.",
    },
    {
      icon: Award,
      title: "Quality",
      description: "We never compromise on quality, using only premium ingredients to create exceptional snacks.",
    },
    {
      icon: Heart,
      title: "Health",
      description: "We believe healthy snacking should be delicious, creating nutritious options without artificial additives.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We support local farmers and give back to communities through various charitable initiatives.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

      {bannersLoading ? (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-muted flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <HeroCarousel banners={banners} />
      )}

      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-products-heading">
              Our Products
            </h2>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <ReviewsGallery reviews={reviews} />

        <section className="py-16 md:py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4" data-testid="text-values-heading">
              Our Core Values
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              These principles guide everything we do, from sourcing ingredients to serving our customers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center" data-testid={`value-card-${index}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold mb-3" data-testid={`text-value-title-${index}`}>{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer onSubscribe={handleSubscribe} />
    </div>
  );
}
