"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Search,
  Edit2,
  Check,
  X,
  Shield,
  User,
  Trash2,
  Save,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  displayName: string;
  memberId?: string;
  role?: string; // 'MEMBER' | 'ADMIN' | 'BOARD'
  status?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formMemberId, setFormMemberId] = useState("");
  const [formRole, setFormRole] = useState("MEMBER");

  // 1. Fetch All Users
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];
      setUsers(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Open Modal ---
  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormName(user.displayName || "");
    setFormMemberId(user.memberId || "");
    setFormRole(user.role || "MEMBER");
  };

  // 2. Save Changes (Role, ID, Name)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        displayName: formName,
        memberId: formMemberId,
        role: formRole,
      });
      setEditingUser(null); // Close modal
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update. Check permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Delete User (Removes Profile Document)
  const handleDelete = async (userId: string) => {
    if (
      !confirm("Are you sure? This will remove the user's profile and access.")
    )
      return;

    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  // Filter
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.memberId || "").includes(searchTerm)
  );

  if (loading) {
    return (
      <div className='p-8 text-center text-slate-500'>Loading users...</div>
    );
  }

  return (
    <div className='p-6 w-full'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          User Management
        </h1>
        <div className='relative w-full sm:w-auto'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse min-w-[800px]'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold'>
              <tr>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  User
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Role
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Union ID
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800 text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group'
                >
                  <td className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400'>
                        {u.displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className='font-medium text-slate-900 dark:text-white text-sm'>
                          {u.displayName}
                        </div>
                        <div className='text-slate-500 text-xs'>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4'>
                    {u.role === "ADMIN" ? (
                      <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium'>
                        <Shield size={10} /> Admin
                      </span>
                    ) : u.role === "BOARD" ? (
                      <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium'>
                        <Shield size={10} /> Board
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium'>
                        <User size={10} /> Member
                      </span>
                    )}
                  </td>
                  <td className='p-4'>
                    {u.memberId ? (
                      <span className='font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs'>
                        {u.memberId}
                      </span>
                    ) : (
                      <span className='text-orange-500 text-xs bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded'>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className='p-4 text-right'>
                    <div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={() => openEditModal(u)}
                        className='p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                        title='Edit User'
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                        title='Remove User'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          <div className='bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                Edit User
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-white'
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Display Name
                </label>
                <input
                  type='text'
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Union ID (Verification)
                </label>
                <input
                  type='text'
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='e.g. 12345'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Role / Permissions
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none'
                >
                  <option value='MEMBER'>Member (Standard Access)</option>
                  <option value='BOARD'>Board (Elevated Access)</option>
                  <option value='ADMIN'>Admin (Full Control)</option>
                </select>
              </div>

              <div className='pt-4 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setEditingUser(null)}
                  className='px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2'
                >
                  <Save size={18} />
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
