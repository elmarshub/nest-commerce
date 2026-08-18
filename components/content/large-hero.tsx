const HERO_IMAGE = "/hero-image.png";

export function LargeHero() {
  return (
    <section className="w-full mb-16 px-6">
      <div className="w-full aspect-16/9 mb-3 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset, plain img keeps this a server component */}
        <img
          src={HERO_IMAGE}
          alt="Modern jewelry collection"
          className="w-full h-full object-cover"
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
