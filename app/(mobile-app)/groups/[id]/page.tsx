"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Settings, MessageSquare, Home, Lock, User, Send } from 'lucide-react';

// --- Types ---
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

// --- Components ---

const BottomNav = ({ activeTab }: { activeTab: string }) => {
  const router = useRouter();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'groups', icon: User, label: 'Groups', path: '/groups' },
    { id: 'vault', icon: Lock, label: 'The Vault', path: '/vault' },
    { id: 'profile', icon: User, label: 'My ID', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            activeTab === item.id ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params?.id === 'string' ? params.id : '';
  const bottomRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Group Details
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      try {
        const docRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setGroup({ id: docSnap.id, ...docSnap.data() } as Group);
        } else {
          setGroup(null);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  // 3. Real-time Messages Listener
  useEffect(() => {
    if (!groupId) return;

    // Listen to the 'messages' sub-collection, ordered by time
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [groupId]);

  // 4. Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !user || !groupId) return;

    try {
      // Add message to sub-collection
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(), // Server-side time is safer
      });
      setNewMessage(''); // Clear input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading group...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 p-6">
         <button onClick={() => router.back()} className="self-start flex items-center gap-2 text-slate-400 mb-8 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-white mb-2">Group not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 pb-20">
      
      {/* Hide Scrollbar Style */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-3 shrink-0">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${group.color || 'bg-blue-600'}`}>
            {group.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold truncate">{group.name}</h2>
            <p className="text-xs text-slate-400 truncate">{group.members?.length || 1} members</p>
        </div>
        <button className="p-2 text-slate-400 hover:text-white">
            <Settings size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-none no-scrollbar">
        {/* Welcome Message */}
        <div className="flex flex-col items-center py-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 ${group.color || 'bg-blue-600'}`}>
                {group.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-white font-bold text-lg">Welcome to {group.name}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">{group.description}</p>
        </div>

        {/* Real Messages List */}
        {messages.map((msg) => {
          const isMe = user?.uid === msg.senderId;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar (Only show for others) */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">
                  ?
                </div>
              )}
              
              {/* Message Bubble */}
              <div className={`
                p-3 rounded-2xl text-sm max-w-[80%] break-words
                ${isMe 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          );
        })}
        
        {/* Invisible element to auto-scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="p-4 bg-slate-900 border-t border-slate-800 shrink-0"
      >
        <div className="flex gap-2">
            <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..." 
                className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-full border border-slate-700 focus:border-blue-500 focus:outline-none"
            />
             <button 
               type="submit"
               disabled={!newMessage.trim()}
               className="p-3 text-white bg-blue-600 rounded-full hover:bg-blue-500 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
                {newMessage.trim() ? <Send size={20} /> : <MessageSquare size={20} />}
            </button>
        </div>
      </form>

      {/* Navigation */}
      <BottomNav activeTab="groups" />
    </div>
  );
}