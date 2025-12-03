"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Paperclip, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Mock Messages Data
const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "Mike",
    text: "Everyone meeting at Lot B?",
    time: "10:00 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Sarah",
    text: "Yeah, we have the tents set up already.",
    time: "10:02 AM",
    isMe: false,
  },
  {
    id: 3,
    sender: "Me",
    text: "On my way! Bringing extra ice.",
    time: "10:05 AM",
    isMe: true,
  },
  {
    id: 4,
    sender: "Mike",
    text: "Perfect. We need it.",
    time: "10:06 AM",
    isMe: false,
  },
  { id: 5, sender: "Me", text: "See you in 10.", time: "10:07 AM", isMe: true },
];

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string; // e.g., "chavos"

  const [message, setMessage] = useState("");

  return (
    <div className='relative z-50 flex h-screen flex-col bg-slate-50 dark:bg-slate-950'>
      {/* 1. Chat Header (Fixed Top) */}
      <header className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.back()}
            className='-ml-2'
          >
            <ArrowLeft className='h-5 w-5 text-slate-600' />
          </Button>
          <div className='flex flex-col'>
            <h1 className='text-sm font-bold text-slate-900 capitalize dark:text-white'>
              {groupId.replace("-", " ")}
            </h1>
            <span className='text-[10px] text-slate-500'>
              24 members online
            </span>
          </div>
        </div>
        <Button variant='ghost' size='icon'>
          <MoreVertical className='h-5 w-5 text-slate-500' />
        </Button>
      </header>

      {/* 2. Message List (Scrollable Middle) */}
      <div className='flex-1 overflow-y-auto p-4 pb-20'>
        {/* pb-20 is crucial to prevent the last message from being hidden behind the input bar */}

        <div className='flex flex-col gap-4'>
          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-max max-w-[75%] flex-col rounded-2xl px-4 py-2 text-sm shadow-sm",
                msg.isMe
                  ? "self-end bg-blue-600 text-white rounded-br-none" // My Message (Right)
                  : "self-start bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none" // Their Message (Left)
              )}
            >
              {!msg.isMe && (
                <span className='mb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500'>
                  {msg.sender}
                </span>
              )}
              <span>{msg.text}</span>
              <span
                className={cn(
                  "mt-1 self-end text-[10px]",
                  msg.isMe ? "text-blue-200" : "text-slate-400"
                )}
              >
                {msg.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Input Area (Fixed Bottom) */}
      <div className='fixed bottom-0 z-20 w-full max-w-md border-t border-slate-200 bg-white px-4 py-3 pb-safe dark:border-slate-800 dark:bg-slate-950'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 text-slate-400'
          >
            <Paperclip className='h-5 w-5' />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Message...'
            className='rounded-full border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900'
          />

          <Button
            size='icon'
            className={cn(
              "shrink-0 rounded-full transition-all",
              message
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-200 text-slate-400"
            )}
            disabled={!message}
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
