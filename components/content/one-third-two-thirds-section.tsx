import Link from "next/link";

const ITEMS = [
  {
    href: "/category/rings",
    image: "/organic-earring.png",
    alt: "Artisan crafted jewelry",
    title: "Artisan Craft",
    description: "Handcrafted pieces with meticulous attention to detail",
    span: "lg:col-span-1",
  },
  {
    href: "/category/necklaces",
    image: "/circular-collection.png",
    alt: "Circular jewelry collection",
    title: "Circular Elements",
    description: "Geometric perfection meets contemporary minimalism",
    span: "lg:col-span-2",
  },
];

export function OneThirdTwoThirdsSection() {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ITEMS.map((item) => (
          <div key={item.href} className={item.span}>
            <Link href={item.href} className="block">
              <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset, plain img keeps this a server component */}
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <h3 className="text-sm font-normal text-foreground mb-1">{item.title}</h3>
            <p className="text-sm font-light text-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
