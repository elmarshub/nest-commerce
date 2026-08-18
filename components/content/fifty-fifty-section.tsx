import Link from "next/link";

const ITEMS = [
  {
    href: "/category/earrings",
    image: "/earrings-collection.png",
    alt: "Earrings collection",
    title: "Organic Forms",
    description: "Nature inspired pieces with fluid, sculptural details",
  },
  {
    href: "/category/bracelets",
    image: "/link-bracelet.png",
    alt: "Chain link bracelet",
    title: "Chain Collection",
    description: "Refined links and connections in precious metals",
  },
];

export function FiftyFiftySection() {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ITEMS.map((item) => (
          <div key={item.href}>
            <Link href={item.href} className="block">
              <div className="w-full aspect-square mb-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset, plain img keeps this a server component */}
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <h3 className="text-sm font-normal text-foreground mb-1">
              {item.title}
            </h3>
            <p className="text-sm font-light text-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
