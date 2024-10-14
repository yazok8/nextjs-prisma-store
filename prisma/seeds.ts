// prisma/seeds.ts

import db from "../src/db/db.js"

async function main() {
  const categories = [
    "Phones",
    "Earbuds",
    "Headphones",
    "Speakers",
    "TV",
    "Cleaning",
    "Kitchen",
    "Men",
    "Women"
  ]

  for (const name of categories) {
    await db.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log("✅ Categories have been seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
