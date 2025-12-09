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
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp | null;
}

interface UserProfile {
  displayName: string;
}

interface ChatWindowProps {
  groupId: string;
  currentUserId: string;
}

export function ChatWindow({ groupId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Realtime Subscription (Messages)
  useEffect(() => {
    if (!groupId) return;

    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt", "asc")
    );

    // Added Error Handling to the Snapshot Listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(msgs);

        // Auto-scroll on new message
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      },
      (error) => {
        console.error("Chat Snapshot Error:", error);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

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

  // 3. Handle Send (Optimistic Updates Added)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !groupId || !currentUserId) return;

    const textToSend = inputText;
    setInputText(""); // Clear UI immediately
    setIsSending(true);

    // Optimistic Update: Show message immediately
    const optimisticMsg: Message = {
      id: "optimistic-" + Date.now(),
      text: textToSend,
      senderId: currentUserId,
      createdAt: null, // Pending timestamp
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Scroll immediately
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 10);

    try {
      await addDoc(collection(db, "groups", groupId, "messages"), {
        text: textToSend,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
      });
      // Success: onSnapshot will take over and replace the optimistic message
    } catch (error) {
      console.error("Error sending message:", error);
      // remove the optimistic message on failure or show error state
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      alert("Failed to send message. Check console for permission errors.");
      setInputText(textToSend); // Restore text
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='flex h-full flex-col bg-slate-950'>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className='flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar'
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
                // Opacity for pending messages
                msg.createdAt === null && "opacity-70"
              )}
            >
              {!isMe && (
                <span className='mb-1 text-[10px] font-bold text-slate-400'>
                  {displayName}
                </span>
              )}
              <span>{msg.text}</span>
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
        <form onSubmit={handleSend} className='flex items-center gap-2'>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Message...'
            className='rounded-full border-slate-700 bg-slate-900 text-white focus:border-blue-500'
          />
          <Button
            type='submit'
            size='icon'
            className={cn(
              "shrink-0 rounded-full transition-all",
              inputText
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-800 text-slate-500"
            )}
            disabled={!inputText || isSending}
          >
            {isSending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
