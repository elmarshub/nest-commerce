import Image from "next/image";

const HERO_IMAGE = "/hero-image.png";

export function LargeHero() {
  return (
    <section className="w-full mb-16 px-6">
      <div className="relative w-full aspect-16/9 mb-3 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Modern jewelry collection"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
      <div>
        <h2 className="text-sm font-normal text-foreground mb-1">
          Modern Heritage
        </h2>
        <p className="text-sm font-light text-foreground">
          Contemporary jewelry crafted with timeless elegance
        </p>
      </div>
    </section>
  );
}
