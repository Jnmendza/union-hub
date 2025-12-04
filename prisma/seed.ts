import { PrismaClient } from "@prisma/client";

// FIX: Force the seed script to use the DIRECT connection (Port 5432).
// This bypasses the Pooler (Port 6543) which causes the "prepared statement" error.
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create a "Board Member" profile (Fake Admin)
  const admin = await prisma.user.upsert({
    where: { email: "board@fronteraunion.com" },
    update: {},
    create: {
      id: "board-admin-id",
      email: "board@fronteraunion.com",
      name: "Elena (Board)",
      role: "BOARD",
      tier: "FOUNDING",
    },
  });

  console.log(`👤 Admin created: ${admin.name}`);

  // 2. Create Announcements
  const announcements = [
    {
      title: "Change to Tailgate Location",
      content:
        "Due to construction in Lot B, we are moving the main tailgate to Lot C (The Bus Lot). Look for the blue flags.",
      category: "URGENT",
      authorId: admin.id,
    },
    {
      title: "Playoff Tifo Night: Volunteers Needed",
      content:
        "We need 15 people to help paint the new tifo this Thursday at the warehouse. Pizza provided!",
      category: "EVENT",
      authorId: admin.id,
    },
    {
      title: "New Scarf Drop",
      content:
        "The 'Frontera Forever' winter scarves are now available for pre-order in the Vault.",
      category: "MERCH",
      authorId: admin.id,
    },
    {
      title: "March to the Match Details",
      content:
        "Meet under the bridge at 6:45 PM. Drums start at 6:55 PM sharp.",
      category: "GENERAL",
      authorId: admin.id,
    },
  ];

  for (const post of announcements) {
    await prisma.announcement.create({
      data: {
        title: post.title,
        content: post.content,
        category: post.category as "URGENT" | "EVENT" | "MERCH" | "GENERAL",
        authorId: post.authorId,
      },
    });
  }

  console.log(`📢 Created ${announcements.length} announcements.`);
  console.log("✅ Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
