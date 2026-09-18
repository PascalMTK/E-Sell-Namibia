import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

function slug(value: string) {
  return slugify(value, { lower: true, strict: true });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error("Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters before seeding.");
  }
  // --- Admin user ---
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "E-Sell Admin",
      email: adminEmail,
      phone: null,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // --- Optional demo customer ---
  if (process.env.SEED_CUSTOMER_EMAIL && process.env.SEED_CUSTOMER_PASSWORD) {
    const customerPasswordHash = await bcrypt.hash(process.env.SEED_CUSTOMER_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: process.env.SEED_CUSTOMER_EMAIL },
      update: {},
      create: {
        name: "Demo Customer",
        email: process.env.SEED_CUSTOMER_EMAIL,
        phone: null,
        passwordHash: customerPasswordHash,
        role: "USER",
      },
    });
  }

  // --- Categories ---
  const categoryDefs = [
    { name: "Electronics", icon: "📱" },
    { name: "Phones", icon: "📞" },
    { name: "Computers", icon: "💻" },
    { name: "Vehicles", icon: "🚗" },
    { name: "Furniture", icon: "🛋️" },
    { name: "Appliances", icon: "🔌" },
    { name: "Fashion", icon: "👕" },
    { name: "Home & Garden", icon: "🏡" },
  ];

  const categories: Record<string, string> = {};
  for (const [index, def] of categoryDefs.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slug(def.name) },
      update: {},
      create: { name: def.name, slug: slug(def.name), icon: def.icon, position: index, active: true },
    });
    categories[def.name] = category.id;
  }

  // --- Products ---
  const productDefs = [
    {
      name: 'iPhone 14 Pro 256GB',
      category: "Phones",
      price: 12500,
      originalPrice: 14000,
      condition: "EXCELLENT" as const,
      brand: "Apple",
      model: "iPhone 14 Pro",
      location: "Windhoek",
      description: "iPhone 14 Pro 256GB in excellent condition, includes original charger.",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      featured: true,
    },
    {
      name: 'Samsung 55" Smart TV',
      category: "Electronics",
      price: 6800,
      condition: "GOOD" as const,
      brand: "Samsung",
      location: "Windhoek",
      description: "Samsung 55 inch 4K Smart TV, great picture quality, minor stand wear.",
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
      featured: true,
    },
    {
      name: "Toyota Corolla",
      category: "Vehicles",
      price: 115000,
      condition: "USED" as const,
      brand: "Toyota",
      model: "Corolla",
      location: "Swakopmund",
      description: "Reliable Toyota Corolla, full service history, ready to drive.",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      newArrival: true,
    },
    {
      name: "MacBook Air M2",
      category: "Computers",
      price: 14900,
      condition: "LIKE_NEW" as const,
      brand: "Apple",
      model: "MacBook Air M2",
      location: "Windhoek",
      description: "MacBook Air M2, barely used, 8GB RAM / 256GB SSD.",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      featured: true,
      newArrival: true,
    },
    {
      name: "L-Shaped Sofa",
      category: "Furniture",
      price: 7500,
      condition: "GOOD" as const,
      location: "Walvis Bay",
      description: "Comfortable L-shaped sofa, fabric upholstery, no tears or stains.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Dining Table Set",
      category: "Furniture",
      price: 4200,
      condition: "USED" as const,
      location: "Oshakati",
      description: "6-seater dining table set, solid wood, minor surface scratches.",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      newArrival: true,
    },
    {
      name: "Sony Mirrorless Camera",
      category: "Electronics",
      price: 9300,
      condition: "EXCELLENT" as const,
      brand: "Sony",
      location: "Windhoek",
      description: "Sony mirrorless camera with 24-70mm lens, low shutter count.",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Modern Lounge Chair",
      category: "Home & Garden",
      price: 1800,
      condition: "LIKE_NEW" as const,
      location: "Walvis Bay",
      description: "Modern accent lounge chair, barely used, smoke-free home.",
      image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
      newArrival: true,
    },
  ];

  for (const def of productDefs) {
    const existing = await prisma.product.findUnique({ where: { slug: slug(def.name) } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: def.name,
        slug: slug(def.name),
        description: def.description,
        price: def.price,
        originalPrice: def.originalPrice ?? null,
        condition: def.condition,
        brand: def.brand ?? null,
        model: def.model ?? null,
        location: def.location,
        pickupAvailable: true,
        windhoekDelivery: def.location === "Windhoek",
        nationwideDelivery: true,
        quantity: 1,
        stockStatus: "IN_STOCK",
        published: true,
        featured: def.featured ?? false,
        newArrival: def.newArrival ?? false,
        publishedAt: new Date(),
        categoryId: categories[def.category],
        createdById: admin.id,
        images: {
          create: [{ url: def.image, isCover: true, position: 0 }],
        },
      },
    });
  }

  // --- Team members ---
  const teamDefs = [
    { name: "Ndapewa Hamunyela", position: "Founder & CEO", bio: "Leads E-Sell Namibia's strategy and product review process." },
    { name: "Johannes Van Der Merwe", position: "Head of Operations", bio: "Oversees logistics, delivery coordination and customer support." },
    { name: "Tulipeni Shikongo", position: "Lead Software Engineer", bio: "Builds and maintains the E-Sell Namibia platform." },
  ];
  for (const [index, def] of teamDefs.entries()) {
    await prisma.teamMember.upsert({
      where: { id: `seed-team-${index}` },
      update: {},
      create: { id: `seed-team-${index}`, name: def.name, position: def.position, bio: def.bio, active: true, position_: index },
    });
  }

  // --- Site settings ---
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      phoneNumber: "081 223 9459",
      whatsappNumber: "+264 81 825 8238",
      address: "Bach Street 8, Windhoek, Khomas, Namibia",
    },
  });

  console.log("Seed complete.");
  console.log("Seeded accounts use credentials from your local environment.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
