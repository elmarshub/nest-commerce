import Image from "next/image";

interface ImageTextBlockProps {
  image: string;
  imageAlt: string;
  title: string;
  content: string;
  imagePosition?: "left" | "right";
}

export function ImageTextBlock({
  image,
  imageAlt,
  title,
  content,
  imagePosition = "left",
}: ImageTextBlockProps) {
  return (
    <div
      className={`flex flex-col ${
        imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row"
      } gap-12 items-center`}
    >
      <div className="relative flex-1 aspect-square lg:aspect-auto lg:h-[800px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-6">
        <h3 className="text-2xl font-light text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
