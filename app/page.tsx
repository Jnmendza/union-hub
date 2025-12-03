import { MatchWidget } from "./(components)/match-widget";
import {
  AnnouncementCard,
  AnnouncementCategory,
} from "./(components)/announcement-card";

// Mock Data (Simulating a Database Response)
const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Change to Tailgate Location",
    author: "Elena (Board)",
    date: "2 hours ago",
    category: "urgent" as AnnouncementCategory,
    content:
      "Due to construction in Lot B, we are moving the main tailgate to Lot C (The Bus Lot). Look for the blue flags.",
  },
  {
    id: 2,
    title: "Playoff Tifo Night: Volunteers Needed",
    author: "Mike (Chavos)",
    date: "Yesterday",
    category: "event" as AnnouncementCategory,
    content:
      "We need 15 people to help paint the new tifo this Thursday at the warehouse. Pizza provided!",
  },
  {
    id: 3,
    title: "New Scarf Drop",
    author: "Merch Team",
    date: "Oct 20",
    category: "merch" as AnnouncementCategory,
    content:
      "The 'Frontera Forever' winter scarves are now available for pre-order in the Vault.",
  },
];

export default function Home() {
  return (
    <div className='min-h-screen bg-slate-50 px-4 pb-24 pt-6 dark:bg-slate-950'>
      {/* Header Greeting */}
      <div className='mb-6 px-1'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Welcome, Jonathan
        </h1>
        <p className='text-sm text-slate-500'>
          Let&apos;s make some noise today.
        </p>
      </div>

      {/* The Widget */}
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
          {ANNOUNCEMENTS.map((post) => (
            <AnnouncementCard
              key={post.id}
              title={post.title}
              author={post.author}
              date={post.date}
              category={post.category}
              content={post.content}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
