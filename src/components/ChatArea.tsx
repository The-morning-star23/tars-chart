/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import { formatMessageTime } from "@/lib/formatTime";
import { useUser } from "@clerk/nextjs";

export default function ChatArea({
  conversationId,
  otherUser,
  onBack,
}: {
  conversationId: Id<"conversations">;
  otherUser: any;
  onBack: () => void;
}) {
  const { user: myUser } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  
  const messages = useQuery(api.messages.list, { conversationId });
  const allUsers = useQuery(api.users.getUsers, { searchTerm: "" });
  
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const deleteMessage = useMutation(api.messages.remove);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  
  const setTypingStatus = useMutation(api.typing.setStatus);
  const typingStatuses = useQuery(api.typing.getStatus, { conversationId });
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlineUsers = useQuery(api.presence.getOnlineUsers) || [];
  const isOnline = onlineUsers.includes(otherUser.clerkId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMessageCount = useRef(0);

  const isOtherUserTyping = typingStatuses && typingStatuses.length > 0;
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢'];

  useEffect(() => {
    if (conversationId) {
      markAsRead({ conversationId }).catch(console.error);
    }
  }, [conversationId, messages, markAsRead]);

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

  useEffect(() => {
    if (!messages) return;

    if (messages.length > prevMessageCount.current) {
      if (!isScrolledUp) {
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

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setTypingStatus({ conversationId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus({ conversationId, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    e?.preventDefault();
    const textToSend = retryText || newMessage.trim();
    if (!textToSend) return;
    
    setIsSending(true);
    setFailedMessage(""); 
    
    try {
      await sendMessage({ conversationId, content: textToSend });
      if (!retryText) setNewMessage(""); 
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      setFailedMessage(textToSend); 
    } finally {
      setIsSending(false);
      setTypingStatus({ conversationId, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleDelete = async (messageId: Id<"messages">) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage({ messageId });
    }
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string) => {
    await toggleReaction({ messageId, emoji });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

      <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button onClick={onBack} className="md:hidden mr-1 text-slate-400 hover:text-white font-bold text-xl transition-colors">&larr;</button>
        
        {otherUser.isGroup ? (
          <div className="w-11 h-11 rounded-full bg-indigo-900/50 flex items-center justify-center ring-2 ring-indigo-500/30 text-indigo-300 font-bold border border-indigo-700/50 shadow-inner">
            {otherUser.name?.[0]?.toUpperCase() ?? "G"}
          </div>
        ) : otherUser.imageUrl ? (
          <Image src={otherUser.imageUrl} alt={otherUser.name ?? "User"} width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-slate-700" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700 text-slate-300 font-medium">
            {otherUser.name?.[0] ?? "?"}
          </div>
        )}

        <div>
          <div className="font-semibold text-lg text-slate-100">{otherUser.name || "Unknown User"}</div>
          <div className="text-xs flex items-center gap-1.5 mt-0.5">
            {otherUser.isGroup ? (
              <span className="text-slate-400 font-medium">{otherUser.memberCount} members</span>
            ) : isOnline ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span><span className="text-emerald-400 font-medium">Online</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-slate-600"></span><span className="text-slate-500">Offline</span></>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 z-10 relative">
        {messages === undefined ? (
          <div className="flex-1 flex flex-col gap-4 mt-2">
            <div className="self-start w-2/3 max-w-[75%] h-16 bg-slate-800 rounded-2xl rounded-tl-sm animate-pulse"></div>
            <div className="self-end w-1/2 max-w-[75%] h-12 bg-indigo-900/30 rounded-2xl rounded-tr-sm animate-pulse"></div>
            <div className="self-start w-3/4 max-w-[75%] h-20 bg-slate-800 rounded-2xl rounded-tl-sm animate-pulse"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 bg-slate-900/50 p-4 rounded-2xl mx-auto border border-slate-800">
            {otherUser.isGroup ? "Be the first to send a message to the group! 👋" : `Say hi to ${otherUser.name}! 👋`}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myUser?.id;
            const senderInfo = allUsers?.find(u => u.clerkId === msg.senderId);
            
            const groupedReactions = (msg.reactions || []).reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return (
              <div key={msg._id} className={`group relative max-w-[75%] flex flex-col ${isMe ? "self-end" : "self-start"}`}>
                
                {otherUser.isGroup && !isMe && !msg.isDeleted && (
                  <span className="text-xs text-indigo-300/80 font-medium mb-1 ml-2">
                    {senderInfo?.name || "Unknown User"}
                  </span>
                )}

                {!msg.isDeleted && (
                  <div className={`absolute -top-5 ${isMe ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 rounded-full px-2 py-1 flex gap-1 shadow-lg z-20`}>
                    {reactionEmojis.map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(msg._id, emoji)} className="hover:scale-125 transition-transform text-sm">{emoji}</button>
                    ))}
                  </div>
                )}

                <div className={`px-4 py-3 shadow-md relative ${isMe ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" : "bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm"} ${msg.isDeleted ? "opacity-70 bg-slate-800/50! border-slate-700/50!" : ""}`}>
                  {msg.isDeleted ? (
                    <span className="italic text-sm text-slate-400 flex items-center gap-2">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                      This message was deleted
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="leading-relaxed">{msg.content}</span>
                      <span className={`text-[10px] mt-1.5 self-end font-medium ${isMe ? "text-indigo-200" : "text-slate-400"}`}>{formatMessageTime(msg._creationTime)}</span>
                      {isMe && (
                        <button onClick={() => handleDelete(msg._id)} className="absolute -top-3 -left-3 bg-slate-800 text-slate-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-lg border border-slate-700 hover:border-rose-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!msg.isDeleted && Object.keys(groupedReactions).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 z-10 ${isMe ? "justify-end" : "justify-start"}`}>
                    {Object.entries(groupedReactions).map(([emoji, count]) => (
                      <button key={emoji} onClick={() => handleReaction(msg._id, emoji)} className="bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-[11px] flex items-center gap-1 shadow-sm hover:bg-slate-700 transition-colors">
                        <span>{emoji}</span><span className="text-slate-300 font-semibold">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
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
        <button onClick={scrollToBottom} className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 z-20 hover:bg-indigo-500 transition-all">
          ↓ {unreadCount} New message{unreadCount > 1 ? 's' : ''}
        </button>
      )}

      {failedMessage && (
        <div className="bg-rose-950/80 border-t border-rose-900 text-rose-200 px-4 py-2 text-sm flex justify-between items-center z-20">
          <span className="truncate mr-4">Failed to send: &quot;{failedMessage}&quot;</span>
          <button 
            onClick={() => handleSend(undefined, failedMessage)}
            disabled={isSending}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0"
          >
            {isSending ? "Retrying..." : "Retry"}
          </button>
        </div>
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
          disabled={!newMessage.trim() || isSending}
          className="bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-400 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none flex items-center justify-center min-w-25"
        >
          {isSending ? (
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse delay-150"></span>
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}