'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ResourceItem, ResourceType } from './resource-item'

// Define the shape of data coming from Prisma
interface Resource {
  id: string
  title: string
  description: string | null
  type: string // Prisma enum returns string in client
  category: string
  size: string | null
  url: string
}

interface VaultBrowserProps {
  initialResources: Resource[]
}

const CATEGORIES = ['All', 'Chants', 'Docs', 'Tifo']

export function VaultBrowser({ initialResources }: VaultBrowserProps) {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Client-side filtering
  const filteredResources = initialResources.filter(item => {
    const matchesCategory = activeTab === 'All' || item.category === activeTab
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search files..." 
          className="bg-white pl-9 dark:bg-slate-900 text-slate-900 dark:text-white dark:placeholder:text-slate-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs (Scrollable) */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
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
      <div className="flex flex-col gap-3">
        {filteredResources.length > 0 ? (
          filteredResources.map((item) => (
            // In a real app, clicking this would open the 'item.url'
            <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id}>
              <ResourceItem 
                title={item.title}
                description={item.description || ''}
                type={item.type as ResourceType}
                size={item.size || ''}
              />
            </a>
          ))
        ) : (
          <div className="py-10 text-center text-slate-400">
            <p>No files found.</p>
          </div>
        )}
      </div>
    </>
  )
}