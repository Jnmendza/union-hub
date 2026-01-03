"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Storage
import { db, storage } from "@/lib/firebase"; // Import storage
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Image as ImageIcon, X, Download } from "lucide-react"; // Added Download
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  text: string;
  imageUrl?: string; // Optional image
  senderId: string;
  createdAt: Timestamp | null;
}

interface UserProfile {
  displayName: string;
}

interface ChatWindowProps {
  unionId: string;
  groupId: string;
  currentUserId: string;
}

export function ChatWindow({
  unionId,
  groupId,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Image Viewer State
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Realtime Subscription (Messages)
  useEffect(() => {
    if (!groupId || !unionId) return;

    const q = query(
      collection(db, "unions", unionId, "groups", groupId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });

    return () => unsubscribe();
  }, [groupId, unionId]);

  // 2. Fetch Sender Profiles
  useEffect(() => {
    const fetchMissingProfiles = async () => {
      const uniqueSenderIds = [...new Set(messages.map((m) => m.senderId))];
      const idsToFetch = uniqueSenderIds.filter(
        (id) => !senderProfiles[id] && id !== currentUserId
      );

      if (idsToFetch.length === 0) return;

      const newProfiles: Record<string, UserProfile> = {};

      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const userSnap = await getDoc(doc(db, "users", id));
            if (userSnap.exists()) {
              newProfiles[id] = userSnap.data() as UserProfile;
            } else {
              newProfiles[id] = { displayName: "Unknown" };
            }
          } catch (e) {
            console.error("Failed to fetch profile", id, e);
          }
        })
      );

      setSenderProfiles((prev) => ({ ...prev, ...newProfiles }));
    };

    if (messages.length > 0) fetchMissingProfiles();
  }, [messages, currentUserId, senderProfiles]);

  // Handle Image Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Handle Send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!inputText.trim() && !selectedImage) ||
      !groupId ||
      !currentUserId ||
      !unionId
    )
      return;

    const textToSend = inputText;
    const imageToSend = selectedImage;

    setInputText("");
    clearImage();
    setIsSending(true);

    // Optimistic Update (Text Only)
    const optimisticMsg: Message = {
      id: "optimistic-" + Date.now(),
      text: textToSend,
      senderId: currentUserId,
      createdAt: null,
      imageUrl: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 10);

    try {
      let finalImageUrl = null;

      // Upload Image
      if (imageToSend) {
        const storageRef = ref(
          storage,
          `chat-images/${groupId}/${Date.now()}_${imageToSend.name}`
        );
        const snapshot = await uploadBytes(storageRef, imageToSend);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(
        collection(db, "unions", unionId, "groups", groupId, "messages"),
        {
          text: textToSend,
          imageUrl: finalImageUrl,
          senderId: currentUserId,
          createdAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      alert("Failed to send message.");
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='flex h-full flex-col bg-slate-950'>
      <div
        ref={scrollRef}
        className='flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar flex flex-col'
      >
        {messages.length === 0 && (
          <div className='flex h-full items-center justify-center text-slate-500 text-sm'>
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const profile = senderProfiles[msg.senderId];
          const displayName = profile?.displayName || "User";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-max max-w-[75%] flex-col rounded-2xl px-4 py-2 text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2",
                isMe
                  ? "self-end bg-blue-600 text-white rounded-br-none"
                  : "self-start bg-slate-800 text-slate-200 rounded-bl-none",
                msg.createdAt === null && "opacity-70"
              )}
            >
              {!isMe && (
                <span className='mb-1 text-[10px] font-bold text-slate-400'>
                  {displayName}
                </span>
              )}

              {/* Image Display */}
              {msg.imageUrl && (
                <div
                  className='mb-2 relative rounded-lg overflow-hidden max-h-60 cursor-pointer hover:opacity-90 active:scale-95 transition-all'
                  onClick={() => setViewingImage(msg.imageUrl!)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={msg.imageUrl}
                    alt='Shared image'
                    className='w-full h-full object-cover'
                  />
                </div>
              )}

              {msg.text && <span>{msg.text}</span>}

              <span
                className={cn(
                  "mt-1 self-end text-[10px]",
                  isMe ? "text-blue-200" : "text-slate-500"
                )}
              >
                {msg.createdAt?.toDate
                  ? msg.createdAt.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sending..."}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className='border-t border-slate-800 bg-slate-950 px-4 py-3'>
        {/* Preview */}
        {imagePreview && (
          <div className='mb-2 flex items-center gap-2'>
            <div className='relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt='Preview'
                className='w-full h-full object-cover'
              />
              <button
                onClick={clearImage}
                className='absolute top-0 right-0 bg-black/50 p-0.5 rounded-bl text-white hover:bg-black/70'
              >
                <X size={12} />
              </button>
            </div>
            <span className='text-xs text-slate-400'>Image selected</span>
          </div>
        )}

        <form onSubmit={handleSend} className='flex items-center gap-2'>
          {/* Image Button */}
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors'
          >
            <ImageIcon size={20} />
          </button>
          <input
            type='file'
            ref={fileInputRef}
            className='hidden'
            accept='image/*'
            onChange={handleImageSelect}
          />

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedImage ? "Add a caption..." : "Message..."}
            className='rounded-full border-slate-700 bg-slate-900 text-white focus:border-blue-500'
          />
          <Button
            type='submit'
            size='icon'
            className={cn(
              "shrink-0 rounded-full transition-all",
              inputText || selectedImage
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-800 text-slate-500"
            )}
            disabled={(!inputText && !selectedImage) || isSending}
          >
            {isSending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </form>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
          {/* Close Button */}
          <button
            onClick={() => setViewingImage(null)}
            className='absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50'
          >
            <X size={24} />
          </button>

          {/* Image */}
          <div className='relative w-full h-full flex items-center justify-center'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewingImage}
              alt='Full view'
              className='max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl'
            />
          </div>

          {/* Actions Bar */}
          <div className='absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4 z-50'>
            <a
              href={viewingImage}
              download
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform hover:bg-gray-100'
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={20} />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
