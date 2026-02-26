/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage({ conversationId, content: newMessage.trim() });
    setNewMessage("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm z-10 shrink-0">
        <button 
          onClick={onBack}
          className="md:hidden mr-2 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &larr;
        </button>
        {otherUser.imageUrl ? (
          <Image 
            src={otherUser.imageUrl} 
            alt={otherUser.name ?? "User"} 
            width={40} 
            height={40} 
            className="w-10 h-10 rounded-full" 
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {otherUser.name?.[0] ?? "?"}
          </div>
        )}
        <div className="font-medium text-lg">{otherUser.name || "Unknown User"}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages === undefined ? (
          <div className="text-center text-gray-500 mt-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">Say hi to {otherUser.name}!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId !== otherUser.clerkId;
            return (
              <div 
                key={msg._id} 
                className={`max-w-[75%] rounded-lg p-3 flex flex-col ${
                  isMe ? "bg-blue-600 text-white self-end" : "bg-white border text-gray-800 self-start"
                }`}
              >
                <span>{msg.content}</span>
                <span className={`text-[10px] mt-1 self-end ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                  {formatMessageTime(msg._creationTime)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2 shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          placeholder="Type a message..."
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}