import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const FOUNDERS_IMAGE = "/founders.png";

export function EditorialSection() {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 max-w-[630px]">
          <h2 className="text-2xl font-normal text-foreground leading-tight md:text-xl">
            Crafted in Lagos, Worn Worldwide
          </h2>
          <p className="text-sm font-light text-foreground leading-relaxed">
            Haven was born in the heart of Festac Town, Lagos where creativity
            meets tradition. Our founders envisioned jewelry that tells a story,
            blending Nigerian artistry with contemporary elegance. Each piece is
            a celebration of our heritage and your unique style.
          </p>
          <Link
            href="/about/our-story"
            className="inline-flex items-center gap-1 text-sm font-light text-foreground hover:text-foreground/80 transition-colors duration-200"
          >
            <span>Read our full story</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="order-first md:order-last">
          <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={FOUNDERS_IMAGE}
              alt="Haven founders"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
