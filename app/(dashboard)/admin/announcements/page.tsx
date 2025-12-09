"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc, // <--- Added
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Info,
  X,
  Edit, // <--- Added Edit
} from "lucide-react";

// --- Types ---
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "URGENT" | "EVENT" | "GENERAL";
  createdAt: Timestamp;
  authorId: string;
}

// --- Components ---
const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    URGENT:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    EVENT:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    GENERAL:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold border ${
        styles[category] || styles["GENERAL"]
      }`}
    >
      {category}
    </span>
  );
};

export default function AdminAnnouncementsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); // <--- Added Edit State

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Announcement["category"]>("GENERAL");

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Fetch Announcements
  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[];
        setAnnouncements(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching announcements:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- Helpers for Modal ---
  const openCreateModal = () => {
    setEditId(null);
    setTitle("");
    setContent("");
    setCategory("GENERAL");
    setShowModal(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setShowModal(true);
  };

  // 3. Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSubmitting(true);
    try {
      if (editId) {
        // UPDATE
        await updateDoc(doc(db, "announcements", editId), {
          title,
          content,
          category,
          // We usually don't update authorId or createdAt on edit
        });
      } else {
        // CREATE
        await addDoc(collection(db, "announcements"), {
          title,
          content,
          category,
          authorId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      setShowModal(false);
      setTitle("");
      setContent("");
      setCategory("GENERAL");
      setEditId(null);
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save. Check permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Check permissions.");
    }
  };

  if (loading)
    return (
      <div className='p-8 text-center text-slate-500'>Loading feed...</div>
    );

  return (
    <div className='p-6 w-full max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Announcements
          </h1>
          <p className='text-slate-500 text-sm'>
            Broadcast updates to the mobile home screen
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20'
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Feed List */}
      <div className='space-y-4'>
        {announcements.length === 0 ? (
          <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed'>
            <Megaphone size={48} className='mx-auto text-slate-300 mb-3' />
            <p className='text-slate-500 font-medium'>No announcements yet</p>
            <button
              onClick={openCreateModal}
              className='text-blue-500 text-sm hover:underline mt-1'
            >
              Create your first post
            </button>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors'
            >
              {/* Icon based on category */}
              <div
                className={`p-3 rounded-lg h-fit shrink-0 ${
                  item.category === "URGENT"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/20"
                    : item.category === "EVENT"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
                }`}
              >
                {item.category === "URGENT" ? (
                  <AlertCircle size={24} />
                ) : item.category === "EVENT" ? (
                  <Calendar size={24} />
                ) : (
                  <Info size={24} />
                )}
              </div>

              <div className='flex-1'>
                <div className='flex justify-between items-start mb-2'>
                  <div className='flex items-center gap-2'>
                    <CategoryBadge category={item.category} />
                    <span className='text-xs text-slate-400'>
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all'>
                    <button
                      onClick={() => openEditModal(item)}
                      className='p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                      title='Edit Post'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                      title='Delete Post'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-1'>
                  {item.title}
                </h3>
                <p className='text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap'>
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          <div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                {editId ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-white'
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Title
                </label>
                <input
                  type='text'
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='e.g. Annual General Meeting'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Category
                </label>
                <div className='flex gap-2'>
                  {["GENERAL", "EVENT", "URGENT"].map((cat) => (
                    <button
                      key={cat}
                      type='button'
                      onClick={() =>
                        setCategory(cat as Announcement["category"])
                      }
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        category === cat
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Message
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className='w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none'
                  placeholder='Type your update here...'
                />
              </div>

              <div className='pt-2 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50'
                >
                  {submitting
                    ? "Saving..."
                    : editId
                    ? "Save Changes"
                    : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
