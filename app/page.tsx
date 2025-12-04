import { MatchWidget } from "./(components)/match-widget";
import {
  AnnouncementCard,
  AnnouncementCategory,
} from "./(components)/announcement-card";
import { prisma } from "@/lib/prisma"; // Import Prisma
import { createClient } from "@/utils/supabase/server"; // For the greeting

// 1. Convert to Async Component
export default async function Home() {
  // Get User Name for Greeting
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optional: Fetch user profile to get their real name (or fallback to Auth email)
  let displayName = "Supporter";
  if (user) {
    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    displayName = profile?.name?.split(" ")[0] || "Supporter";
  }

  // 2. Fetch Real Announcements from DB
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }, // Include author details if you want their name
  });

  return (
    <div className='min-h-screen bg-slate-50 px-4 pb-24 pt-6 dark:bg-slate-950'>
      {/* Header Greeting */}
      <div className='mb-6 px-1'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Welcome, {displayName}
        </h1>
        <p className='text-sm text-slate-500'>
          Let&apos;s make some noise today.
        </p>
      </div>

      {/* The Widget (Still Static for now, but that's okay) */}
      <section className='mb-8'>
        <MatchWidget
          opponentName='LA Galaxy'
          opponentLogoUrl='/placeholder.png'
          matchDate='Sat, Oct 24'
          matchTime='7:30 PM'
          venue='Snapdragon Stadium'
          isHome={true}
        />
      </section>

      {/* News Feed Section */}
      <section>
        <div className='mb-4 flex items-center justify-between px-1'>
          <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
            Union Updates
          </h2>
          <button className='text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400'>
            View All
          </button>
        </div>

        <div className='flex flex-col gap-2'>
          {/* 3. Map through REAL data */}
          {announcements.map((post) => (
            <AnnouncementCard
              key={post.id}
              title={post.title}
              // Format date nicely (e.g. "Oct 24")
              date={new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              author={post.author.name || "Admin"}
              // We need to cast the category string to the component's expected type
              // or ensure the DB Enums match exactly.
              category={post.category.toLowerCase() as AnnouncementCategory}
              content={post.content}
            />
          ))}

          {announcements.length === 0 && (
            <p className='text-center text-sm text-slate-400 py-4'>
              No updates yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
