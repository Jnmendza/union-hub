import { GroupRow, GroupType } from "../../(components)/group-row";

// Mock Data representing your "Frontera Union" hierarchy
const GROUPS = [
  {
    id: "announcements",
    name: "Union Announcements",
    lastMessage: "Tickets for the LAFC away game are now live.",
    timestamp: "10:42 AM",
    unreadCount: 2,
    type: "announcement" as GroupType,
  },
  {
    id: "chavos",
    name: "The Chavos (Official)",
    lastMessage: "Mike: Everyone wear black for the march!",
    timestamp: "11:20 AM",
    unreadCount: 5,
    type: "private" as GroupType,
  },
  {
    id: "general",
    name: "General Chat",
    lastMessage: "Did anyone see the starting lineup?",
    timestamp: "11:15 AM",
    unreadCount: 0,
    type: "public" as GroupType,
  },
  {
    id: "merch",
    name: "Ticket & Merch Swap",
    lastMessage: "Selling 2 tickets for section 104.",
    timestamp: "Yesterday",
    unreadCount: 0,
    type: "public" as GroupType,
  },
  {
    id: "drums",
    name: "La Banda (Drummers)",
    lastMessage: "New cadence practice at 6pm.",
    timestamp: "Mon",
    unreadCount: 0,
    type: "private" as GroupType,
  },
];

export default function GroupsPage() {
  return (
    <div className='min-h-screen bg-white pb-24 dark:bg-slate-950'>
      {/* Header */}
      <div className='sticky top-0 z-10 border-b border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80'>
        <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
          Groups
        </h1>
      </div>

      {/* List */}
      <div className='flex flex-col'>
        {GROUPS.map((group) => (
          <GroupRow
            key={group.id}
            id={group.id}
            name={group.name}
            lastMessage={group.lastMessage}
            timestamp={group.timestamp}
            unreadCount={group.unreadCount}
            type={group.type}
          />
        ))}
      </div>
    </div>
  );
}
