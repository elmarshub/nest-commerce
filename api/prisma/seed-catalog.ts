import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const CATEGORIES = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Rings for every occasion',
    image: 'rings-collection.png',
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Necklaces and pendants',
    image: 'circular-collection.png',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Earrings, studs and hoops',
    image: 'earrings-collection.png',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Bracelets and bangles',
    image: 'link-bracelet.png',
  },
] as const;

const PRODUCTS: {
  name: string;
  sku: string;
  categorySlug: (typeof CATEGORIES)[number]['slug'];
  price: string;
  stock: number;
  image: string;
  description: string;
}[] = [
  {
    name: 'Lintel Ring',
    sku: 'RNG-001',
    categorySlug: 'rings',
    price: '650.00',
    stock: 12,
    image: 'lintel-ring.jpg',
    description:
      'A clean, architectural band with a flat lintel profile. Sterling silver with 18k gold plating, sized for everyday wear.',
  },
  {
    name: 'Halo Ring',
    sku: 'RNG-002',
    categorySlug: 'rings',
    price: '890.00',
    stock: 8,
    image: 'halo-ring.jpg',
    description:
      'A single stone encircled by a fine halo setting, catching light from every angle. Hypoallergenic, hand-finished.',
  },
  {
    name: 'Meridian Collar',
    sku: 'NCK-001',
    categorySlug: 'necklaces',
    price: '1150.00',
    stock: 6,
    image: 'meridian-collar.jpg',
    description:
      'A structured collar necklace that sits close to the collarbone. Statement-weight, finished in polished gold vermeil.',
  },
  {
    name: 'Cascade Pendant',
    sku: 'NCK-002',
    categorySlug: 'necklaces',
    price: '720.00',
    stock: 10,
    image: 'cascade-pendant.jpg',
    description:
      'A single drop pendant on a fine chain, designed to layer or wear alone. Adjustable length.',
  },
  {
    name: 'Whisper Pendant',
    sku: 'NCK-003',
    categorySlug: 'necklaces',
    price: '540.00',
    stock: 14,
    image: 'whisper-pendant.jpg',
    description:
      'A minimal, barely-there pendant on a delicate chain — built for everyday layering.',
  },
  {
    name: 'Aria Chain',
    sku: 'NCK-004',
    categorySlug: 'necklaces',
    price: '980.00',
    stock: 9,
    image: 'aria-chain.jpg',
    description:
      'A substantial link chain with a soft curb weave, equally at home dressed up or down.',
  },
  {
    name: 'Eclipse Earrings',
    sku: 'ERG-001',
    categorySlug: 'earrings',
    price: '620.00',
    stock: 16,
    image: 'eclipse-earrings.jpg',
    description:
      'Architectural, curved statement earrings inspired by classical geometry. Post and butterfly back.',
  },
  {
    name: 'Organic Earrings',
    sku: 'ERG-002',
    categorySlug: 'earrings',
    price: '410.00',
    stock: 18,
    image: 'organic-earrings.jpg',
    description:
      'Fluid, sculptural earrings with an organic, hand-formed silhouette. Lightweight for all-day wear.',
  },
  {
    name: 'Oblique Earrings',
    sku: 'ERG-003',
    categorySlug: 'earrings',
    price: '480.00',
    stock: 20,
    image: 'oblique-earrings.jpg',
    description:
      'Angular drop earrings with a sharp, modern line. A versatile everyday statement piece.',
  },
  {
    name: 'Pantheon Earrings',
    sku: 'ERG-004',
    categorySlug: 'earrings',
    price: '710.00',
    stock: 11,
    image: 'pantheon-earrings.jpg',
    description:
      'Domed studs with a sophisticated interplay of curves and angles, inspired by classical architecture.',
  },
  {
    name: 'Link Bracelet',
    sku: 'BRC-001',
    categorySlug: 'bracelets',
    price: '650.00',
    stock: 11,
    image: 'link-bracelet.jpg',
    description:
      'A classic chain-link bracelet in polished sterling silver, sized with a secure clasp.',
  },
  {
    name: 'Span Bracelet',
    sku: 'BRC-002',
    categorySlug: 'bracelets',
    price: '540.00',
    stock: 13,
    image: 'span-bracelet.jpg',
    description:
      'An open cuff bracelet designed to sit flush against the wrist. One size, adjustable fit.',
  },
  {
    name: 'Arcus Bracelet',
    sku: 'BRC-003',
    categorySlug: 'bracelets',
    price: '790.00',
    stock: 9,
    image: 'arcus-bracelet.jpg',
    description:
      'A curved bangle with a smooth, continuous arc — designed to be worn solo or stacked.',
  },
  {
    name: 'Shadowline Bracelet',
    sku: 'BRC-004',
    categorySlug: 'bracelets',
    price: '920.00',
    stock: 7,
    image: 'shadowline-bracelet.jpg',
    description:
      'A tapered, sculptural bracelet with a shadow-line groove finish. Made to be a daily signature piece.',
  },
];

const IMAGE_BASE = '/products';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const categoryIdBySlug = new Map<string, string>();

    for (const category of CATEGORIES) {
      const record = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          imageUrl: `/${category.image}`,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: `/${category.image}`,
        },
      });
      categoryIdBySlug.set(category.slug, record.id);
    }

    for (const product of PRODUCTS) {
      const categoryId = categoryIdBySlug.get(product.categorySlug);
      if (!categoryId) continue;

      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId,
          imageUrl: `${IMAGE_BASE}/${product.image}`,
          isActive: true,
        },
        create: {
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId,
          imageUrl: `${IMAGE_BASE}/${product.image}`,
          isActive: true,
        },
      });
    }

    console.log(
      `Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products with Haven's real product photography`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Catalog seed failed:', error);
  process.exit(1);
});
