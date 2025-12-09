"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
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
  Folder,
  FileText,
  Link as LinkIcon,
  Plus,
  Search,
  ExternalLink,
  X,
  UploadCloud,
  File,
  Eye,
} from "lucide-react";

// --- Types ---
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "LINK" | "TEXT" | "FILE";
  category: "General" | "Chants" | "Bylaws" | "Tifo";
  createdBy: string;
  createdAt: Timestamp;
}

// --- Components ---
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newType, setNewType] = useState<Resource["type"]>("LINK");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Fetch Resources (Firestore)
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
        console.error("Error fetching vault resources:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Add Resource Handler
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    setSubmitting(true);
    try {
      let finalUrl = newUrl;

      // A. Upload File to Firebase Storage
      if (newType === "FILE" && selectedFile) {
        // const fileExt = selectedFile.name.split(".").pop();
        const storageRef = ref(
          storage,
          `vault/${user.uid}/${Date.now()}_${selectedFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalUrl = await getDownloadURL(snapshot.ref);
      }

      // B. Save to Firestore
      await addDoc(collection(db, "resources"), {
        title: newTitle,
        description: newDesc,
        url: finalUrl,
        type: newType,
        category: newCategory,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setShowAddModal(false);
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setNewUrl("");
      setSelectedFile(null);
      setNewCategory("General");
      setNewType("LINK");
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Could not add resource. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Filtering ---
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
    <div className='min-h-full bg-slate-950 text-slate-200 p-4 pb-24'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6 pt-4'>
        <div>
          <h1 className='text-2xl font-bold text-white'>The Vault</h1>
          <p className='text-slate-400 text-sm'>Group resources & assets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className='bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full transition-colors shadow-lg shadow-blue-900/20'
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className='space-y-4 mb-6'>
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500'
            size={18}
          />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search resources...'
            className='w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-600'
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
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className='space-y-3'>
        {filteredResources.length === 0 ? (
          <div className='text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl'>
            <Folder size={48} className='mx-auto text-slate-700 mb-3' />
            <p className='text-slate-500 font-medium'>No items found</p>
            <p className='text-slate-600 text-sm mt-1'>
              Try adjusting filters or add a new item.
            </p>
          </div>
        ) : (
          filteredResources.map((item) => (
            <div
              key={item.id}
              className='bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4 active:scale-[0.99] transition-transform'
            >
              <div className='p-3 bg-slate-800 rounded-lg shrink-0'>
                <ResourceIcon type={item.type} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start mb-1'>
                  <h3 className='text-white font-medium truncate pr-2'>
                    {item.title}
                  </h3>
                  <CategoryBadge category={item.category} />
                </div>
                <p className='text-slate-400 text-xs line-clamp-2 mb-2'>
                  {item.description || "No description provided."}
                </p>

                {item.type === "TEXT" ? (
                  <button
                    onClick={() => setViewingResource(item)}
                    className='inline-flex items-center gap-1 text-slate-300 text-xs font-medium hover:text-white'
                  >
                    Read <Eye size={12} />
                  </button>
                ) : (
                  item.url && (
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-blue-400 text-xs font-medium hover:underline'
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

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
          <div className='bg-slate-950 w-full max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-800 p-6 animate-in slide-in-from-bottom-10 duration-200'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-white'>Add to Vault</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className='p-1 bg-slate-900 rounded-full text-slate-400'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddResource} className='space-y-4'>
              <div>
                <label className='text-xs font-medium text-slate-400 ml-1'>
                  Title
                </label>
                <input
                  type='text'
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500'
                  placeholder='e.g. 2024 Season Chant Sheet'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs font-medium text-slate-400 ml-1'>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none'
                  >
                    <option>General</option>
                    <option>Chants</option>
                    <option>Bylaws</option>
                    <option>Tifo</option>
                  </select>
                </div>
                <div>
                  <label className='text-xs font-medium text-slate-400 ml-1'>
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value as Resource["type"]);
                      setNewUrl("");
                      setSelectedFile(null);
                    }}
                    className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none'
                  >
                    <option value='LINK'>Link</option>
                    <option value='FILE'>File</option>
                    <option value='TEXT'>Text</option>
                  </select>
                </div>
              </div>

              {/* Conditional Input based on Type */}
              <div>
                <label className='text-xs font-medium text-slate-400 ml-1'>
                  {newType === "FILE"
                    ? "Upload File"
                    : newType === "TEXT"
                    ? "Content"
                    : "URL"}
                </label>

                {newType === "FILE" ? (
                  <div className='relative'>
                    <input
                      type='file'
                      onChange={(e) =>
                        setSelectedFile(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      className='hidden'
                      id='file-upload'
                    />
                    <label
                      htmlFor='file-upload'
                      className='flex items-center justify-center gap-2 w-full bg-slate-900 border border-dashed border-slate-700 rounded-xl px-4 py-6 text-slate-400 hover:bg-slate-800 hover:border-slate-500 cursor-pointer transition-colors'
                    >
                      <UploadCloud size={20} />
                      <span className='text-sm truncate'>
                        {selectedFile
                          ? selectedFile.name
                          : "Tap to select file"}
                      </span>
                    </label>
                  </div>
                ) : newType === "TEXT" ? (
                  <textarea
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none'
                    placeholder='Type your text content here...'
                  />
                ) : (
                  <input
                    type='text'
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500'
                    placeholder='https://...'
                  />
                )}
              </div>

              {newType !== "TEXT" && (
                <div>
                  <label className='text-xs font-medium text-slate-400 ml-1'>
                    Description
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-20 resize-none'
                    placeholder='Optional details...'
                  />
                </div>
              )}

              <button
                type='submit'
                disabled={submitting || (newType === "FILE" && !selectedFile)}
                className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {submitting ? "Saving..." : "Add Resource"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Read Text Modal */}
      {viewingResource && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-slate-950 w-full max-w-lg rounded-2xl border border-slate-800 p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-start mb-4 shrink-0'>
              <div>
                <h2 className='text-xl font-bold text-white'>
                  {viewingResource.title}
                </h2>
                <div className='flex gap-2 mt-1'>
                  <CategoryBadge category={viewingResource.category} />
                  <span className='text-xs text-slate-500 py-0.5'>
                    {viewingResource.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingResource(null)}
                className='p-1 bg-slate-900 rounded-full text-slate-400 hover:text-white'
              >
                <X size={20} />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto bg-slate-900 rounded-xl p-4 border border-slate-800'>
              <p className='text-slate-300 whitespace-pre-wrap leading-relaxed text-sm'>
                {viewingResource.url}
              </p>
            </div>

            <div className='mt-4 shrink-0 text-center'>
              <button
                onClick={() => setViewingResource(null)}
                className='text-blue-500 text-sm font-medium hover:underline'
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
