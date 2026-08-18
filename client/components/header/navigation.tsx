"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart } from "lucide-react";
import { ShoppingBagDrawer } from "./shopping-bag-drawer";
import { WishlistDrawer } from "./wishlist-drawer";
import { SearchOverlay } from "@/components/search/search-overlay";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";

// TODO: real category imagery for the mega-menu (Haven's version used
// /rings-collection.png etc.) once product photography is sourced —
// dropped for now rather than linking to images that don't exist yet.
const navItems = [
  {
    name: "Shop",
    href: "/",
    submenuItems: ["Rings", "Necklaces", "Earrings", "Bracelets"],
  },
  {
    name: "About",
    href: "/about/our-story",
    submenuItems: [
      "Our Story",
      "Sustainability",
      "Size Guide",
      "Customer Care",
      "Store Locator",
    ],
  },
];

export function Navigation() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const totalItems = useCartStore((state) => state.totalItems);
  const { user, signOut } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const openAuthModal = useAuthModalStore((state) => state.open);

  const cartCount = totalItems();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="relative bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 relative">
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 top-2.5" : "top-1.5"
              }`}
            />
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 top-2.5" : "top-3.5"
              }`}
            />
          </div>
        </button>

        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="block text-xl font-light tracking-widest text-foreground">
            HAVEN
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>

          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Favorites"
            onClick={() => setIsWishlistOpen(true)}
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[0.6rem] rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label={user ? "Account" : "Sign in"}
            onClick={() => (user ? router.push("/account") : openAuthModal())}
          >
            <User className="w-5 h-5" />
          </button>

          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={() => setIsShoppingBagOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-foreground pointer-events-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="px-6 py-8">
              <ul className="space-y-2">
                {navItems
                  .find((item) => item.name === activeDropdown)
                  ?.submenuItems.map((subItem) => (
                    <li key={subItem}>
                      <Link
                        href={
                          activeDropdown === "About"
                            ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                            : `/category/${subItem.toLowerCase()}`
                        }
                        className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-2"
                      >
                        {subItem}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-nav border-b border-border z-50 overflow-hidden"
          >
            <div className="px-6 py-8">
              <div className="space-y-6">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <div className="mt-3 pl-4 space-y-2">
                      {item.submenuItems.map((subItem) => (
                        <Link
                          key={subItem}
                          href={
                            item.name === "About"
                              ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                              : `/category/${subItem.toLowerCase()}`
                          }
                          className="text-nav-foreground/70 hover:text-nav-hover text-sm font-light block py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Signed in as {user.firstName || user.email}
                      </p>
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-nav-foreground hover:text-nav-hover text-sm font-light block"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-nav-foreground hover:text-nav-hover text-sm font-light"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        openAuthModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-nav-foreground hover:text-nav-hover text-lg font-light"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShoppingBagDrawer
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
      />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </nav>
  );
}
