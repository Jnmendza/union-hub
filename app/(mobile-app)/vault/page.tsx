"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Folder,
  FileText,
  Link as LinkIcon,
  Search,
  ExternalLink,
  X,
  File,
  Eye,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "LINK" | "TEXT" | "FILE";
  category: "General" | "Chants" | "Bylaws" | "Tifo";
  visibility?: "PUBLIC" | "ADMIN";
  createdAt: Timestamp | null;
}

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    General: "bg-slate-700 text-slate-200",
    Chants: "bg-purple-900/50 text-purple-200 border-purple-700/50",
    Bylaws: "bg-blue-900/50 text-blue-200 border-blue-700/50",
    Tifo: "bg-orange-900/50 text-orange-200 border-orange-700/50",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-medium border border-transparent ${
        colors[category] || colors["General"]
      }`}
    >
      {category}
    </span>
  );
};

const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "LINK":
      return <LinkIcon size={18} className='text-blue-400' />;
    case "TEXT":
      return <FileText size={18} className='text-slate-400' />;
    case "FILE":
      return <File size={18} className='text-yellow-400' />;
    default:
      return <FileText size={18} />;
  }
};

export default function VaultPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];

        const publicItems = allItems.filter(
          (item) => item.visibility === "PUBLIC" || !item.visibility
        );

        setResources(publicItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching vault resources:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "General", "Chants", "Bylaws", "Tifo"];

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[50vh] text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Opening Vault...</p>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 pb-24 transition-colors duration-300'>
      <div className='flex justify-between items-center mb-6 pt-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            The Vault
          </h1>
          <p className='text-slate-500 text-sm'>
            Official Documents & Resources
          </p>
        </div>
      </div>

      <div className='space-y-4 mb-6'>
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search resources...'
            className='w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-400 transition-colors'
          />
        </div>

        <div className='flex gap-2 overflow-x-auto pb-2 no-scrollbar'>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? "bg-slate-200 text-slate-900 border-slate-200"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        {filteredResources.length === 0 ? (
          <div className='text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl'>
            <Folder
              size={48}
              className='mx-auto text-slate-300 dark:text-slate-700 mb-3'
            />
            <p className='text-slate-500 font-medium'>No items found</p>
          </div>
        ) : (
          filteredResources.map((item) => (
            <div
              key={item.id}
              className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-4 active:scale-[0.99] transition-transform shadow-sm'
            >
              <div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0'>
                <ResourceIcon type={item.type} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start mb-1'>
                  <h3 className='text-slate-900 dark:text-white font-medium truncate pr-2'>
                    {item.title}
                  </h3>
                  <CategoryBadge category={item.category} />
                </div>
                <p className='text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-2'>
                  {item.description || "No description provided."}
                </p>

                {item.type === "TEXT" ? (
                  <button
                    onClick={() => setViewingResource(item)}
                    className='inline-flex items-center gap-1 text-slate-400 dark:text-slate-300 text-xs font-medium hover:text-slate-900 dark:hover:text-white'
                  >
                    Read <Eye size={12} />
                  </button>
                ) : (
                  item.url && (
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline'
                    >
                      {item.type === "LINK" ? "Open Link" : "Download File"}{" "}
                      <ExternalLink size={10} />
                    </a>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {viewingResource && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col max-h-[80vh] shadow-2xl'>
            <div className='flex justify-between items-start mb-4 shrink-0'>
              <div>
                <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                  {viewingResource.title}
                </h2>
                <div className='flex gap-2 mt-1'>
                  <CategoryBadge category={viewingResource.category} />
                  <span className='text-xs text-slate-500 py-0.5'>
                    {viewingResource.createdAt?.toDate
                      ? viewingResource.createdAt.toDate().toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingResource(null)}
                className='p-1 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white'
              >
                <X size={20} />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800'>
              <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm'>
                {viewingResource.url}
              </p>
            </div>

            <div className='mt-4 shrink-0 text-center'>
              <button
                onClick={() => setViewingResource(null)}
                className='text-blue-600 dark:text-blue-500 text-sm font-medium hover:underline'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
