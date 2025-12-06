"use client";

import React, { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Import from your config file
import { useRouter } from 'next/navigation'; // Use Next.js router
import { Home, Users, Lock, User, Plus, Search, ChevronLeft } from 'lucide-react';

// --- Types ---
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: string;
  members: string[];
}

interface CreateGroupData {
  name: string;
  description: string;
}

// --- Components ---

// BottomNav moved to layout

// 2. Create Group Modal
interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (data: CreateGroupData) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Create New Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Group Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Weekend Hikers"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none h-24 resize-none"
              placeholder="What is this group about?"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 p-3 text-slate-300 hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim()}
              className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function GroupsPage() {
  const router = useRouter(); // Initialize router
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch((error) => console.error("Auth failed", error));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Groups
  useEffect(() => {
    // Note: We don't need 'if (!user)' check for public groups strictly, 
    // but good for private ones.
    
    // IMPORTANT: Simplified path to match your [id] page
    const q = collection(db, 'groups'); 
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const groupsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Group[];
        setGroups(groupsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching groups:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleSelectGroup = (group: Group) => {
    // THIS IS THE FIX: Navigate to the dynamic route
    router.push(`/groups/${group.id}`);
  };

  const handleCreateGroup = async ({ name, description }: CreateGroupData) => {
    if (!user) return;
    
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-rose-600', 'bg-orange-600', 'bg-emerald-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      // IMPORTANT: Simplified path to match your [id] page
      await addDoc(collection(db, 'groups'), {
        name,
        description,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: [user.uid],
        color: randomColor
      });
      setShowCreateModal(false);
    } catch (e) {
      console.error("Error creating group:", e);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-20">
      {/* Page Header */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Your Groups</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search groups..." 
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Groups List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p>Loading groups...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-800">
                <Users size={48} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No groups found</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-400 font-medium hover:text-blue-300"
                >
                  Create your first group
                </button>
              </div>
            ) : (
              groups.map((group) => (
                <div 
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 active:bg-slate-700 transition-all cursor-pointer flex items-center gap-4 hover:border-slate-600"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${group.color || 'bg-blue-600'}`}>
                    {group.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{group.name}</h3>
                    <p className="text-slate-400 text-sm truncate">{group.description || 'No description'}</p>
                  </div>
                  <ChevronLeft className="text-slate-600 rotate-180" size={20} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateGroup} 
        />
      )}

      {/* Bottom Nav removed - handled by layout */}
    </div>
  );
}