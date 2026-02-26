/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import { formatMessageTime } from "@/lib/formatTime";

export default function ChatArea({
  conversationId,
  otherUser,
  onBack,
}: {
  conversationId: Id<"conversations">;
  otherUser: any;
  onBack: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const messages = useQuery(api.messages.list, { conversationId });
  const sendMessage = useMutation(api.messages.send);
  
  const setTypingStatus = useMutation(api.typing.setStatus);
  const typingStatuses = useQuery(api.typing.getStatus, { conversationId });
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOtherUserTyping = typingStatuses && typingStatuses.length > 0;

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    setTypingStatus({ conversationId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus({ conversationId, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage({ conversationId, content: newMessage.trim() });
    setNewMessage("");
    
    setTypingStatus({ conversationId, isTyping: false });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative">
      {/* Background pattern (optional subtle touch) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

      <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button 
          onClick={onBack}
          className="md:hidden mr-1 text-slate-400 hover:text-white font-bold text-xl transition-colors"
        >
          &larr;
        </button>
        {otherUser.imageUrl ? (
          <Image 
            src={otherUser.imageUrl} 
            alt={otherUser.name ?? "User"} 
            width={44} 
            height={44} 
            className="w-11 h-11 rounded-full ring-2 ring-slate-700" 
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700 text-slate-300 font-medium">
            {otherUser.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg text-slate-100">{otherUser.name || "Unknown User"}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 z-10">
        {messages === undefined ? (
          <div className="text-center text-slate-500 mt-4 animate-pulse">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 bg-slate-900/50 p-4 rounded-2xl mx-auto border border-slate-800">
            Say hi to {otherUser.name}! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId !== otherUser.clerkId;
            return (
              <div 
                key={msg._id} 
                className={`max-w-[75%] px-4 py-3 flex flex-col shadow-md ${
                  isMe 
                    ? "bg-indigo-600 text-white self-end rounded-2xl rounded-tr-sm" 
                    : "bg-slate-800 border border-slate-700 text-slate-100 self-start rounded-2xl rounded-tl-sm"
                }`}
              >
                <span className="leading-relaxed">{msg.content}</span>
                <span className={`text-[10px] mt-1.5 self-end font-medium ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                  {formatMessageTime(msg._creationTime)}
                </span>
              </div>
            );
          })
        )}
        {isOtherUserTyping && (
          <div className="bg-slate-800 border border-slate-700 text-slate-400 self-start rounded-2xl rounded-tl-sm px-5 py-3 text-sm shadow-md flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3 shrink-0 z-10">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          className="flex-1 px-5 py-3 bg-slate-950 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 transition-all shadow-inner"
          placeholder="Type your message..."
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-400 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none flex items-center justify-center"
        >
          Send
        </button>
      </form>
    </div>
  );
}