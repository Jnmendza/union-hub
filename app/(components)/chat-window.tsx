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
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MoreHorizontal, Ban, Flag, X } from "lucide-react";
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
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // UI State for menus
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [reportingMsg, setReportingMsg] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 0. Listen to Current User's Blocked List
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = onSnapshot(doc(db, "users", currentUserId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBlockedUsers(data.blockedUserIds || []);
      }
    });
    return () => unsub();
  }, [currentUserId]);

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

  // 4. Block User
  const handleBlock = async (userIdToBlock: string) => {
    if (!confirm("Block this user? You won't see their messages anymore."))
      return;
    try {
      await updateDoc(doc(db, "users", currentUserId), {
        blockedUserIds: arrayUnion(userIdToBlock),
      });
      setActiveMenuMsgId(null);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user.");
    }
  };

  // 5. Report Message
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMsg) return;

    try {
      // Create report
      await addDoc(collection(db, "reports"), {
        reportedBy: currentUserId,
        reportedUser: reportingMsg.senderId,
        messageId: reportingMsg.id,
        reason: reportReason,
        text: reportingMsg.text,
        groupId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Report submitted. Thank you for keeping the community safe.");
      setReportingMsg(null);
      setReportReason("");
    } catch (error) {
      console.error("Error reporting:", error);
      alert("Failed to submit report.");
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

        {messages
          .filter((m) => !blockedUsers.includes(m.senderId)) // Filter blocked messages
          .map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const profile = senderProfiles[msg.senderId];
            const displayName = profile?.displayName || "User";

            return (
              <div className='relative group' key={msg.id}>
                <div
                  className={cn(
                    "flex w-max max-w-[75%] flex-col rounded-2xl px-4 py-2 text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2",
                    isMe
                      ? "self-end bg-blue-600 text-white rounded-br-none ml-auto"
                      : "self-start bg-slate-800 text-slate-200 rounded-bl-none",
                    // Opacity for pending messages
                    msg.createdAt === null && "opacity-70"
                  )}
                >
                  {!isMe && (
                    <div className='flex justify-between items-center gap-2 mb-1'>
                      <span className='text-[10px] font-bold text-slate-400'>
                        {displayName}
                      </span>
                    </div>
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

                {/* Menu Trigger (Only for others) */}
                {!isMe && (
                  <div className='absolute top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={() =>
                        setActiveMenuMsgId(
                          activeMenuMsgId === msg.id ? null : msg.id
                        )
                      }
                      className='p-1 hover:bg-slate-800 rounded-full text-slate-500'
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                )}

                {/* Dropdown Menu */}
                {activeMenuMsgId === msg.id && (
                  <div className='absolute top-8 -right-20 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10 w-32 py-1 flex flex-col overflow-hidden'>
                    <button
                      onClick={() => handleBlock(msg.senderId)}
                      className='flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 w-full text-left'
                    >
                      <Ban size={12} className='text-red-400' /> Block User
                    </button>
                    <button
                      onClick={() => {
                        setReportingMsg(msg);
                        setActiveMenuMsgId(null);
                      }}
                      className='flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 w-full text-left'
                    >
                      <Flag size={12} className='text-orange-400' /> Report
                    </button>
                  </div>
                )}
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
      {/* Report Modal */}
      {reportingMsg && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-bold text-white'>Report Message</h3>
              <button
                onClick={() => setReportingMsg(null)}
                className='text-slate-500 hover:text-white'
              >
                <X size={20} />
              </button>
            </div>
            <p className='text-slate-400 text-sm mb-4 bg-slate-800 p-3 rounded-lg italic'>
              &quot;{reportingMsg.text}&quot;
            </p>

            <form onSubmit={handleReport} className='space-y-4'>
              <div>
                <label className='text-xs text-slate-500 mb-1 block'>
                  Reason for report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className='w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500'
                  required
                >
                  <option value=''>Select a reason...</option>
                  <option value='spam'>Spam or unwanted</option>
                  <option value='harassment'>Harassment or bullying</option>
                  <option value='hate_speech'>Hate speech</option>
                  <option value='sensitive'>Sensitive content</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setReportingMsg(null)}
                  className='text-slate-400 hover:text-white hover:bg-slate-800'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-orange-600 hover:bg-orange-500 text-white'
                >
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
