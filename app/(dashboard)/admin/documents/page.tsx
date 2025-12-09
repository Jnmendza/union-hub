"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc, // <--- Added updateDoc
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import {
  FileText,
  Link as LinkIcon,
  Folder,
  Trash2,
  Plus,
  ExternalLink,
  Search,
  X,
  UploadCloud,
  File,
  Lock,
  Globe,
  Edit, // <--- Added Edit
} from "lucide-react";

// --- Types ---
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "LINK" | "TEXT" | "FILE";
  category: "General" | "Chants" | "Bylaws" | "Tifo";
  visibility: "PUBLIC" | "ADMIN";
  createdAt: Timestamp;
  createdBy: string;
}

// --- Components ---
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "LINK":
      return <LinkIcon size={20} className='text-blue-500' />;
    case "TEXT":
      return <FileText size={20} className='text-slate-500' />;
    case "FILE":
      return <File size={20} className='text-yellow-500' />;
    default:
      return <Folder size={20} className='text-slate-400' />;
  }
};

const VisibilityBadge = ({ visibility }: { visibility: string }) => {
  if (visibility === "ADMIN") {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-white border border-slate-600'>
        <Lock size={10} /> Admin Only
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'>
      <Globe size={10} /> Public
    </span>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    General:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Chants:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    Bylaws: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    Tifo: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold ${
        styles[category] || styles["General"]
      }`}
    >
      {category}
    </span>
  );
};

export default function AdminDocumentsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); // <--- Track editing ID

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newType, setNewType] = useState<"LINK" | "TEXT" | "FILE">("LINK");
  const [newVisibility, setNewVisibility] = useState<"PUBLIC" | "ADMIN">(
    "PUBLIC"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Fetch Resources
  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        setResources(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching resources:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // --- Helper: Open Modal for Adding ---
  const openAddModal = () => {
    setEditId(null); // Clear ID = Create Mode
    setNewTitle("");
    setNewDesc("");
    setNewUrl("");
    setNewCategory("General");
    setNewType("LINK");
    setNewVisibility("PUBLIC");
    setSelectedFile(null);
    setShowModal(true);
  };

  // --- Helper: Open Modal for Editing ---
  const openEditModal = (resource: Resource) => {
    setEditId(resource.id); // Set ID = Edit Mode
    setNewTitle(resource.title);
    setNewDesc(resource.description || "");
    setNewUrl(resource.url || "");
    setNewCategory(resource.category);
    setNewType(resource.type);
    setNewVisibility(resource.visibility);
    setSelectedFile(null); // Reset file input (unless they want to replace it)
    setShowModal(true);
  };

  // 3. Submit Handler (Create OR Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    setSubmitting(true);
    try {
      let finalUrl = newUrl;

      // Handle File Upload (If new file selected)
      if (newType === "FILE" && selectedFile) {
        const folder = newVisibility === "ADMIN" ? "admin-docs" : "library";
        const storageRef = ref(
          storage,
          `${folder}/${Date.now()}_${selectedFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalUrl = await getDownloadURL(snapshot.ref);
      }

      const docData = {
        title: newTitle,
        description: newDesc,
        url: finalUrl,
        type: newType,
        category: newCategory,
        visibility: newVisibility,
        // Only update createdBy/createdAt if creating new
        ...(editId
          ? {}
          : {
              createdBy: user.uid,
              createdAt: serverTimestamp(),
            }),
        // Add updatedAt for edits
        ...(editId ? { updatedAt: serverTimestamp() } : {}),
      };

      if (editId) {
        // UPDATE Existing
        await updateDoc(doc(db, "resources", editId), docData);
      } else {
        // CREATE New
        await addDoc(collection(db, "resources"), docData);
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Failed to save. Check permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove it from everyone's Vault."))
      return;
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Check permissions.");
    }
  };

  // Filter Logic
  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className='p-8 text-center text-slate-500'>
        Loading vault items...
      </div>
    );

  return (
    <div className='p-6 w-full max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Documents & Resources
          </h1>
          <p className='text-slate-500 text-sm'>
            Manage "The Vault" content for members
          </p>
        </div>
        <button
          onClick={openAddModal}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20'
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      {/* Search Bar */}
      <div className='relative mb-6'>
        <Search
          className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          size={18}
        />
        <input
          type='text'
          placeholder='Search documents...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Resource Table */}
      <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse min-w-[800px]'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold'>
              <tr>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800 w-16'>
                  Type
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Title
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Access
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Category
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800'>
                  Content
                </th>
                <th className='p-4 border-b border-slate-200 dark:border-slate-800 text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className='p-8 text-center text-slate-500'>
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredResources.map((item) => (
                  <tr
                    key={item.id}
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group'
                  >
                    <td className='p-4 text-center'>
                      <div className='flex justify-center'>
                        <TypeIcon type={item.type} />
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='font-medium text-slate-900 dark:text-white'>
                        {item.title}
                      </div>
                      <div className='text-slate-500 text-xs truncate max-w-xs'>
                        {item.description}
                      </div>
                    </td>
                    <td className='p-4'>
                      <VisibilityBadge visibility={item.visibility} />
                    </td>
                    <td className='p-4'>
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className='p-4'>
                      {item.type === "TEXT" ? (
                        <span className='text-slate-400 text-xs italic'>
                          Text Content
                        </span>
                      ) : (
                        <a
                          href={item.url}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center gap-1 text-blue-500 hover:underline text-sm'
                        >
                          {item.type === "FILE" ? "Download" : "Visit Link"}{" "}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td className='p-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => openEditModal(item)}
                          className='p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                          title='Edit'
                        >
                          <Edit size={18} />
                        </button>
                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                          title='Delete'
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          <div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                {editId ? "Edit Resource" : "Add Resource"}
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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='e.g. 2024 Season Chant Sheet'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                    Visibility
                  </label>
                  <select
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value as any)}
                    className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='PUBLIC'>Public (Everyone)</option>
                    <option value='ADMIN'>Admin Only</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option>General</option>
                    <option>Chants</option>
                    <option>Bylaws</option>
                    <option>Tifo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => {
                    setNewType(e.target.value as any);
                    if (!editId) {
                      setNewUrl("");
                      setSelectedFile(null);
                    }
                  }}
                  className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='LINK'>Link</option>
                  <option value='FILE'>File Upload</option>
                  <option value='TEXT'>Text Content</option>
                </select>
              </div>

              {/* Conditional Input */}
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                  {newType === "FILE"
                    ? "Upload File"
                    : newType === "TEXT"
                    ? "Content"
                    : "URL"}
                </label>

                {newType === "FILE" ? (
                  <div className='space-y-2'>
                    {/* If editing and URL exists, show current file link */}
                    {editId && newUrl && !selectedFile && (
                      <div className='text-xs text-slate-500 mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded'>
                        Current File:{" "}
                        <a
                          href={newUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-500 hover:underline'
                        >
                          View
                        </a>
                      </div>
                    )}
                    <div className='relative'>
                      <input
                        type='file'
                        onChange={(e) =>
                          setSelectedFile(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                        className='hidden'
                        id='admin-file-upload'
                      />
                      <label
                        htmlFor='admin-file-upload'
                        className='flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl px-4 py-8 text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                      >
                        <UploadCloud size={20} />
                        <span className='text-sm truncate'>
                          {selectedFile
                            ? selectedFile.name
                            : editId && newUrl
                            ? "Change File (Optional)"
                            : "Click to select file"}
                        </span>
                      </label>
                    </div>
                  </div>
                ) : newType === "TEXT" ? (
                  <textarea
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className='w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none'
                    placeholder='Paste text content here...'
                  />
                ) : (
                  <input
                    type='text'
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='https://example.com'
                  />
                )}
              </div>

              {newType !== "TEXT" && (
                <div>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
                    Description
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none'
                    placeholder='Optional details...'
                  />
                </div>
              )}

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
                  disabled={
                    submitting ||
                    (newType === "FILE" && !selectedFile && !editId)
                  } // Allow saving edit without new file
                  className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50'
                >
                  {submitting
                    ? "Saving..."
                    : editId
                    ? "Save Changes"
                    : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
