import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full bg-background text-foreground pt-8 pb-2 px-6 border-t border-border mt-48">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-widest mb-4">
            HAVEN
          </h2>
          <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-md mb-6">
            Luxury jewelry crafted for the modern individual
          </p>

          <div className="space-y-2 text-sm font-light text-muted-foreground">
            <div>
              <p className="font-normal text-foreground mb-1">Visit Us</p>
              <p>22 Festival Road</p>
              <p>Festac Town, Lagos</p>
              <p>Nigeria</p>
            </div>
            <div>
              <p className="font-normal text-foreground mb-1 mt-3">Contact</p>
              <p>+234 812 345 6789</p>
              <p>hello@havenjewelry.ng</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-normal mb-4">Shop</h4>
            <ul className="space-y-2">
              {["Rings", "Earrings", "Bracelets", "Necklaces"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-normal mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                "Size Guide",
                "Care Instructions",
                "Returns",
                "Shipping",
                "Contact",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-normal mb-4">Connect</h4>
            <ul className="space-y-2">
              {["Instagram", "Pinterest", "Newsletter"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border -mx-6 px-6 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-foreground mb-1 md:mb-0">
            &copy; {new Date().getFullYear()} Haven. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy-policy"
              className="text-sm font-light text-foreground hover:text-muted-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm font-light text-foreground hover:text-muted-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
