"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { Plus, Search, ChevronLeft, Users } from "lucide-react";
import { useUnion } from "@/app/(components)/union-provider";

// --- Types ---
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
}

interface CreateGroupData {
  name: string;
  description: string;
}

// --- Components ---
const CreateGroupModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: CreateGroupData) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description });
  };

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 p-6'>
        <h2 className='text-xl font-bold text-white mb-6'>Create New Group</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-slate-400 text-sm mb-1'>
              Group Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none'
              placeholder='e.g. Weekend Hikers'
              autoFocus
            />
          </div>
          <div>
            <label className='block text-slate-400 text-sm mb-1'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none h-24 resize-none'
              placeholder='What is this group about?'
            />
          </div>
          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 p-3 text-slate-300 hover:bg-slate-800 rounded-xl font-medium transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!name.trim()}
              className='flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GroupsPage() {
  const router = useRouter();
  const { currentUnion, isLoading: unionLoading } = useUnion(); // <--- 2. Get Union
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch Groups (Scoped to Union)
  useEffect(() => {
    // Wait for Union to load. If none, do nothing (Provider redirects)
    if (!currentUnion) return;

    // PATH CHANGE: unions/{id}/groups
    const q = query(
      collection(db, "unions", currentUnion.id, "groups"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Group[];
        setGroups(groupsList);
        setDataLoading(false);
      },
      (error) => {
        console.error("Error fetching groups:", error);
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUnion]);

  // Create Group (Scoped to Union)
  const handleCreateGroup = async ({ name, description }: CreateGroupData) => {
    if (!auth.currentUser || !currentUnion) return;

    const colors = [
      "bg-blue-600",
      "bg-indigo-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-rose-600",
      "bg-orange-600",
      "bg-emerald-600",
      "bg-teal-600",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      // PATH CHANGE: unions/{id}/groups
      await addDoc(collection(db, "unions", currentUnion.id, "groups"), {
        name,
        description,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.uid],
        color: randomColor,
      });
      setShowCreateModal(false);
    } catch (e) {
      console.error("Error creating group:", e);
      alert("Failed to create group. Check permissions.");
    }
  };

  const handleSelectGroup = (group: Group) => {
    router.push(`/groups/${group.id}`);
  };

  if (unionLoading || dataLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Loading groups...</p>
      </div>
    );
  }

  return (
    <div className='bg-slate-950 min-h-screen text-slate-200 font-sans pb-24'>
      {/* Page Header */}
      <div className='p-6 pt-8'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Groups</h1>
            <p className='text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider'>
              {currentUnion?.name}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-blue-900/20'
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className='relative mb-6'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500'
            size={20}
          />
          <input
            type='text'
            placeholder='Search groups...'
            className='w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-600'
          />
        </div>

        {/* Groups List */}
        <div className='space-y-3'>
          {groups.length === 0 ? (
            <div className='text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed'>
              <Users size={48} className='mx-auto text-slate-700 mb-3' />
              <p className='text-slate-500'>No groups found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className='mt-4 text-blue-500 font-medium hover:text-blue-400 text-sm'
              >
                Create the first group
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className='bg-slate-900/80 p-4 rounded-2xl border border-slate-800 active:bg-slate-800 transition-all cursor-pointer flex items-center gap-4'
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                    group.color || "bg-blue-600"
                  }`}
                >
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-white font-semibold text-lg truncate'>
                    {group.name}
                  </h3>
                  <p className='text-slate-400 text-sm truncate'>
                    {group.description || "No description"}
                  </p>
                </div>
                <ChevronLeft className='text-slate-700 rotate-180' size={20} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
