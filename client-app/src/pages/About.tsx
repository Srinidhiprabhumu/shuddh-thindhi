import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Storefront/Header";
import { Footer } from "@/components/Storefront/Footer";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import type { BrandContent } from "@shared/schema";

export default function About() {
  const { items } = useCartStore();

  const { data: brandContent = {} } = useQuery<Record<string, BrandContent>>({
    queryKey: ["/api/brand-content"],
  });

  const handleSubscribe = async (email: string) => {
    const response = await fetch(`${window.location.origin}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  const mission = brandContent["mission"];
  const story = brandContent["story"];
  const values = brandContent["values"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="text-page-title">
            Our Story
          </h1>

          <div className="space-y-12">
            {mission && (
              <Card className="p-8 md:p-12">
                <h2 className="font-serif text-3xl font-bold mb-6 text-primary" data-testid="text-mission-title">
                  {mission.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-mission-content">
                  {mission.content}
                </p>
              </Card>
            )}

            {story && (
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6" data-testid="text-story-title">
                  {story.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-story-content">
                  {story.content}
                </p>
              </div>
            )}

            {values && (
              <Card className="p-8 md:p-12 bg-card">
                <h2 className="font-serif text-3xl font-bold mb-6 text-center" data-testid="text-values-title">
                  {values.title}
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap" data-testid="text-values-content">
                  {values.content}
                </div>
              </Card>
            )}

            {!mission && !story && !values && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Content coming soon...
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer onSubscribe={handleSubscribe} />
    </div>
  );
}
