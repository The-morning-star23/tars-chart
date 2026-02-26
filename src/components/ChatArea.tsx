/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
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

  // Online status query
  const onlineUsers = useQuery(api.presence.getOnlineUsers) || [];
  const isOnline = onlineUsers.includes(otherUser.clerkId);

  // Auto-scroll State & Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessageCount = useRef(0);

  const isOtherUserTyping = typingStatuses && typingStatuses.length > 0;

  // 1. Handle Scrolling Logic
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsScrolledUp(!isNearBottom);
    if (isNearBottom) setUnreadCount(0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  // 2. Watch for new messages
  useEffect(() => {
    if (!messages) return;

    if (messages.length > prevMessageCount.current) {
      if (!isScrolledUp) {
        // Safe timeout to bypass ESLint warning and let DOM paint
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      } else {
        const newMessagesAdded = messages.length - prevMessageCount.current;
        setUnreadCount((prev) => prev + newMessagesAdded);
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages, isScrolledUp]);

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setTypingStatus({ conversationId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus({ conversationId, isTyping: false });
    }, 1500);
  };

  // Handle sending message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage({ conversationId, content: newMessage.trim() });
    setNewMessage("");
    
    setTypingStatus({ conversationId, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    setTimeout(scrollToBottom, 100); 
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

      <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button 
          onClick={onBack}
          className="md:hidden mr-1 text-slate-400 hover:text-white font-bold text-xl transition-colors"
        >
          &larr;
        </button>
        {otherUser.imageUrl ? (
          <Image src={otherUser.imageUrl} alt={otherUser.name ?? "User"} width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-slate-700" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700 text-slate-300 font-medium">
            {otherUser.name?.[0] ?? "?"}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg text-slate-100">{otherUser.name || "Unknown User"}</div>
          <div className="text-xs flex items-center gap-1.5 mt-0.5">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> 
                <span className="text-emerald-400 font-medium">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-600"></span> 
                <span className="text-slate-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 z-10 relative"
      >
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
                  isMe ? "bg-indigo-600 text-white self-end rounded-2xl rounded-tr-sm" : "bg-slate-800 border border-slate-700 text-slate-100 self-start rounded-2xl rounded-tl-sm"
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
        <div ref={messagesEndRef} />
      </div>

      {isScrolledUp && unreadCount > 0 && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 z-20 hover:bg-indigo-500 transition-all"
        >
          ↓ {unreadCount} New message{unreadCount > 1 ? 's' : ''}
        </button>
      )}

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