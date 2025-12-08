'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { sendMessage } from '@/app/(mobile-app)/groups/[id]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define the shape of a message
type Message = {
  id: string
  content: string
  senderId: string
  createdAt: Date
  sender: {
    name: string | null
  }
}

// Database shape of the message (snake_case from Supabase)
interface MessageDB {
  id: string
  content: string
  senderId: string
  created_at: string
  groupId: string
}

interface ChatWindowProps {
  initialMessages: Message[]
  currentUserId: string
  groupId: string
}

export function ChatWindow({ initialMessages, currentUserId, groupId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Ref for auto-scrolling
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Scroll to bottom on load and on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 2. Realtime Subscription
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `groupId=eq.${groupId}`, // Only listen to THIS group
        },
        async (payload) => {
          const newMsg = payload.new as MessageDB
          
          // Optimization: If *I* sent this, I already optimistically added it.
          // We can check IDs to prevent duplicates, but for MVP simpler is better:
          // We will fetch the sender name separately or just default to "Someone"
          // because Realtime payload doesn't include relations (sender name).
          
          // Logic: Only add if we don't already have this ID (prevents duplicates from optimistic UI)
          setMessages((prev) => {
            if (prev.find(m => m.id === newMsg.id)) return prev
            
            // Construct a message object from the payload
            return [...prev, {
              id: newMsg.id,
              content: newMsg.content,
              senderId: newMsg.senderId,
              createdAt: new Date(newMsg.created_at), // Note: Supabase uses snake_case in payload
              sender: { name: 'Member' } // We don't get joined data in realtime, fallback name
            }]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId])

  // 3. Handle Send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const tempId = Math.random().toString() // Temporary ID
    const text = inputText
    setInputText('') // Clear input immediately (UX)
    
    // Optimistic Update: Show it immediately before server confirms
    const optimisticMsg: Message = {
      id: tempId,
      content: text,
      senderId: currentUserId,
      createdAt: new Date(),
      sender: { name: 'Me' }
    }
    
    setMessages(prev => [...prev, optimisticMsg])

    // Send to Server
    setIsSending(true)
    const savedMsg = await sendMessage(groupId, text)
    setIsSending(false)

    // Replace optimistic message with real one (to get real ID)
    if (savedMsg) {
      setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m))
    }
  }

  return (
    <div className="flex h-full flex-col">
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-4 space-y-4"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-max max-w-[75%] flex-col rounded-2xl px-4 py-2 text-sm shadow-sm",
                isMe 
                  ? "self-end bg-blue-600 text-white rounded-br-none" 
                  : "self-start bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none"
              )}
            >
              {!isMe && (
                <span className="mb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {msg.sender.name || "Member"}
                </span>
              )}
              <span>{msg.content}</span>
              <span className={cn(
                "mt-1 self-end text-[10px]",
                isMe ? "text-blue-200" : "text-slate-400"
              )}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
              </span>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 pb-safe dark:border-slate-800 dark:bg-slate-950">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message..." 
            className="rounded-full border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
          />
          <Button 
            type="submit"
            size="icon" 
            className={cn(
              "shrink-0 rounded-full transition-all",
              inputText ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-200 text-slate-400"
            )}
            disabled={!inputText || isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}