import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "../AuthButton";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import type { Announcement } from "@shared/schema";

interface HeaderProps {
  cartItemCount: number;
}

export function Header({ cartItemCount }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Auto-rotate announcements every 3 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    ...(isAuthenticated ? [{ href: "/my-orders", label: "My Orders" }] : []),
    { href: "/about", label: "Our Story" },
  ];

  return (
    <>
      {announcements.length > 0 && (
        <div
          className="w-full py-2 text-sm font-medium tracking-wide relative overflow-hidden"
          style={{
            backgroundColor: announcements[currentAnnouncementIndex]?.backgroundColor || "#000000",
            color: announcements[currentAnnouncementIndex]?.textColor || "#ffffff",
          }}
        >
          <div 
            className="whitespace-nowrap"
            style={{
              animation: 'scrollText 12s linear infinite',
              transform: 'translateX(100%)'
            }}
          >
            {announcements[currentAnnouncementIndex]?.text}
          </div>
        </div>
      )}
      
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" data-testid="link-home">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary cursor-pointer hover-elevate rounded-md px-2 py-1">
                Shuddh Thindhi
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <span className={`text-sm font-medium cursor-pointer hover-elevate px-3 py-2 rounded-md transition-colors ${
                    location === link.href ? "text-primary" : "text-foreground"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <AuthButton />
              
              <Link href="/cart" data-testid="link-cart">
                <Button size="icon" variant="ghost" className="relative" data-testid="button-cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      data-testid="badge-cart-count"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border" data-testid="nav-mobile-menu">
            <nav className="flex flex-col px-4 py-4 gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${location === link.href ? "bg-accent" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`button-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
