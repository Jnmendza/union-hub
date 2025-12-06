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

  // 3. Create Resources (The Vault)
  const resources = [
    {
      title: "Dale Dale SD",
      description: "Main Chant Lyrics",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Placeholder
      type: "PDF",
      category: "Chants",
      size: "120 KB"
    },
    {
      title: "Drum Cadence A",
      description: "Snare & Bass Rhythm",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder
      type: "AUDIO",
      category: "Chants",
      size: "3:20"
    },
    {
      title: "Union Bylaws 2025",
      description: "Official Rules & Regulations",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: "PDF",
      category: "Docs",
      size: "4.2 MB"
    },
    {
      title: "Tifo Grid: Playoff",
      description: "Section 102 Layout Plan",
      url: "https://via.placeholder.com/600x400",
      type: "IMAGE",
      category: "Tifo",
      size: "2.8 MB"
    },
    {
      title: "Vamos San Diego",
      description: "New Chant (Slow Build)",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      type: "AUDIO",
      category: "Chants",
      size: "1:45"
    },
  ]

  for (const item of resources) {
    await prisma.resource.create({
      data: {
        title: item.title,
        description: item.description,
        url: item.url,
        type: item.type as 'PDF' | 'AUDIO' | 'IMAGE',
        category: item.category,
        size: item.size
      }
    })
  }
  
  console.log(`📂 Created ${resources.length} vault resources.`)
  
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
