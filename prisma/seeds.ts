// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Seed Admin User (Production Only)
  if (isProduction) {
    const adminEmail = 'ykherfan@ecom.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('SecureAdminPass123!', 10);
      await prisma.user.create({
        data: {
          name: 'Yazan Kherfan',
          email: adminEmail,
          hashedPassword,
          role: 'ADMIN', // Corrected to match Role enum
        },
      });
      console.log('✅ Admin user created successfully.');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }
  }

  // 2. Seed Categories (Both Environments)
  const categories = [
    'Phones',
    'Earbuds',
    'Headphones',
    'Speakers',
    'TV',
    'Cleaning',
    'Kitchen',
    'Watches',
    'Gaming',
    'Bedroom',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`✅ Category "${name}" ensured.`);
  }

  // 3. Fetch Categories with Their IDs for Product Association
  const categoryRecords = await prisma.category.findMany();
  const categoryMap: Record<string, string> = {};

  categoryRecords.forEach((category) => {
    categoryMap[category.name] = category.id;
  });

  // 4. Check if Products are Already Seeded
  const existingProducts = await prisma.product.findMany();
  if (existingProducts.length > 0) {
    console.log('ℹ️ Products already seeded.');
    return;
  }

  // 5. Seed Products (Both Environments)
  const products = [
    {
      name: 'Wireless Headphones',
      priceInCents: 2999, // $29.99
      imagePath:
        'https://i.pcmag.com/imagery/roundups/01NpXLj2H3fMdvjfb6RBQFT-17..v1652307874.jpg',
      description: 'High-quality wireless headphones with noise cancellation.',
      filePath: null,
      brand: 'Sony',
      category: 'Headphones',
    },
    {
      name: 'Smart Watch',
      priceInCents: 19999, // $199.99
      imagePath:
        'https://cdn.mos.cms.futurecdn.net/gpgJMNyNnJG9fnZWUCoT68-320-80.jpeg',
      description:
        'Stay connected and track your fitness with this smart watch.',
      filePath: null,
      brand: 'TechTime',
      category: 'Watches',
    },
    {
      name: 'Gaming Keyboard',
      priceInCents: 4999, // $49.99
      imagePath:
        'https://m.media-amazon.com/images/I/71IOtS5z2eL._AC_UF894,1000_QL80_.jpg',
      description:
        'Mechanical gaming keyboard with customizable RGB lighting.',
      filePath: null,
      brand: 'GamerPro',
      category: 'Gaming',
    },
    {
      name: 'Espresso Machine',
      priceInCents: 8999, // $89.99
      imagePath: 'https://m.media-amazon.com/images/I/6190zcm9RVL.jpg',
      description:
        'Brew the perfect espresso with ease using this compact machine.',
      filePath: null,
      brand: 'CafeMaster',
      category: 'Kitchen',
    },
    {
      name: 'Bluetooth Speaker',
      priceInCents: 3499, // $34.99
      imagePath: 'https://m.media-amazon.com/images/I/718yxonHN8L.jpg',
      description:
        'Portable Bluetooth speaker with excellent sound quality.',
      filePath: null,
      brand: 'Sowo',
      category: 'Speakers',
    },
    {
      name: 'Stainless Steel Water Bottle',
      priceInCents: 1499, // $14.99
      imagePath: 'https://m.media-amazon.com/images/I/71WfIv9f9IL.jpg',
      description:
        'Insulated water bottle keeps your drinks cold for 24 hours.',
      filePath: null,
      brand: 'HydroFlow',
      category: 'Kitchen',
    },
    {
      name: 'LED Desk Lamp',
      priceInCents: 2599, // $25.99
      imagePath:
        'https://m.media-amazon.com/images/I/51u+FMn9OUL._AC_UF894,1000_QL80_.jpgg',
      description:
        'Adjustable LED desk lamp with multiple brightness settings.',
      filePath: null,
      brand: 'BrightLight',
      category: 'Bedroom',
    },
    {
      name: 'Electric Kettle',
      priceInCents: 2999, // $29.99
      imagePath: 'https://m.media-amazon.com/images/I/71Q-pS+mTRL.jpg',
      description:
        'Quick-boil electric kettle with auto shut-off feature.',
      filePath: null,
      brand: 'Ambitelligence',
      category: 'Kitchen',
    },
  ];

  for (const product of products) {
    // 6. Check if the Product Already Exists
    const existingProduct = await prisma.product.findUnique({
      where: { name: product.name }, // Ensure 'name' is unique in the Prisma schema
    });

    if (existingProduct) {
      console.log(`ℹ️ Product "${product.name}" already exists.`);
      continue;
    }

    // 7. Retrieve the Category ID
    const categoryId = categoryMap[product.category];
    if (!categoryId) {
      console.warn(
        `⚠️ Category "${product.category}" not found for product "${product.name}". Skipping.`
      );
      continue;
    }

    // 8. Create the Product with Category Reference
    await prisma.product.create({
      data: {
        name: product.name,
        priceInCents: product.priceInCents,
        imagePath: product.imagePath,
        description: product.description,
        filePath: product.filePath,
        brand: product.brand,
        categoryId: categoryId, // Associate with the correct category
      },
    });

    console.log(`✅ Product "${product.name}" seeded successfully.`);
  }

  console.log('✅ Seed script completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Corrected from 'db' to 'prisma'
  });
