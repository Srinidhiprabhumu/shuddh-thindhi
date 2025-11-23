import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Instagram } from "lucide-react";

interface FooterProps {
  onSubscribe: (email: string) => Promise<void>;
}

export function Footer({ onSubscribe }: FooterProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubscribe(email);
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-4">Shuddha Thindi</h3>
            <p className="text-muted-foreground mb-4">
              Traditional Indian snacks crafted with purity and love. Bringing authentic flavors to your doorstep.
            </p>
            <div className="space-y-3">
              <a 
                href="https://www.instagram.com/shuddhathindi?utm_source=qr&igsh=dzQwa3czY3pjdXdjEmail" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover-elevate px-3 py-2 rounded-md"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-sm font-medium">Follow us on Instagram</span>
              </a>
              <div className="text-muted-foreground text-sm space-y-1">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a href="mailto:shuddhathindi@gmail.com" className="hover:text-primary transition-colors">
                    shuddhathindi@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-medium">Address:</span> Maddur 571428
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-home">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-products">
                  Products
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                  Our Story
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-subscribe">
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Also available on section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h4 className="font-semibold text-lg text-center mb-6">Also available on</h4>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <a 
              href="https://www.flipkart.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-elevate transition-transform"
              aria-label="Available on Flipkart"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">f</span>
              </div>
            </a>
            <a 
              href="https://www.meesho.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-elevate transition-transform"
              aria-label="Available on Meesho"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">m</span>
              </div>
            </a>
            <a 
              href="https://www.amazon.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-elevate transition-transform"
              aria-label="Available on Amazon"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">a</span>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">© {new Date().getFullYear()} Shuddha Thindi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
