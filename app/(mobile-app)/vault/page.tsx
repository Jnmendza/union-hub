"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input"; // npx shadcn-ui@latest add input
import { ResourceItem, ResourceType } from "../../(components)/resource-item";

// Mock Data
const RESOURCES = [
  {
    id: 1,
    title: "Dale Dale SD",
    description: "Main Chant Lyrics",
    type: "pdf",
    category: "Chants",
    size: "120 KB",
  },
  {
    id: 2,
    title: "Drum Cadence A",
    description: "Snare & Bass Rhythm",
    type: "audio",
    category: "Chants",
    size: "3:20",
  },
  {
    id: 3,
    title: "Union Bylaws 2025",
    description: "Official Rules",
    type: "pdf",
    category: "Docs",
    size: "4.2 MB",
  },
  {
    id: 4,
    title: "Tifo Grid: Playoff",
    description: "Section 102 Layout",
    type: "image",
    category: "Tifo",
    size: "2.8 MB",
  },
  {
    id: 5,
    title: "Financial Report Q3",
    description: "October 2025",
    type: "pdf",
    category: "Docs",
    size: "1.1 MB",
  },
  {
    id: 6,
    title: "Vamos San Diego",
    description: "New Chant (Audio)",
    type: "audio",
    category: "Chants",
    size: "1:45",
  },
];

const CATEGORIES = ["All", "Chants", "Docs", "Tifo"];

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic: Filter by Category AND Search Term
  const filteredResources = RESOURCES.filter((item) => {
    const matchesCategory = activeTab === "All" || item.category === activeTab;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='min-h-screen bg-slate-50 px-4 pb-24 pt-6 dark:bg-slate-950'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          The Vault
        </h1>
        <p className='text-sm text-slate-500'>
          Official documents & media library.
        </p>
      </div>

      {/* Search Bar */}
      <div className='relative mb-6'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
        <Input
          placeholder='Search files...'
          className='pl-9 bg-white dark:bg-slate-900'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs (Scrollable) */}
      <div className='mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === cat
                ? "bg-blue-900 text-white dark:bg-blue-600"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className='flex flex-col gap-3'>
        {filteredResources.length > 0 ? (
          filteredResources.map((item) => (
            <ResourceItem
              key={item.id}
              title={item.title}
              description={item.description}
              type={item.type as ResourceType}
              size={item.size}
            />
          ))
        ) : (
          // Empty State
          <div className='py-10 text-center text-slate-400'>
            <p>No files found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
