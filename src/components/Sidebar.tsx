/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { formatMessageTime } from "@/lib/formatTime";
import { useUser } from "@clerk/nextjs";

// Reusable Skeleton Component for Sidebar
const SidebarSkeleton = () => (
  <div className="p-4 border-b border-slate-800/50 flex items-center gap-4">
    <div className="w-11 h-11 rounded-full bg-slate-800 animate-pulse shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
      <div className="h-3 bg-slate-800 rounded w-3/4 animate-pulse"></div>
    </div>
  </div>
);

export default function Sidebar({ onSelectUser }: { onSelectUser: (user: any, conversationId: string) => void }) {
  const { user: myUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  
  const users = useQuery(api.users.getUsers, { searchTerm });
  const recentConversations = useQuery(api.conversations.getMyConversations);
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);
  const onlineUsers = useQuery(api.presence.getOnlineUsers) || [];

  const handleUserClick = async (user: any) => {
    const conversationId = await getOrCreateConversation({ otherUserId: user.clerkId });
    onSelectUser(user, conversationId);
    setSearchTerm("");
  };

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 placeholder-slate-500 transition-all shadow-inner"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isSearching ? (
          users === undefined ? (
            <>
              <SidebarSkeleton />
              <SidebarSkeleton />
              <SidebarSkeleton />
            </>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          ) : (
            users.map((user) => (
              <div key={user._id} onClick={() => handleUserClick(user)} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/80 cursor-pointer flex items-center gap-4 transition-all duration-200">
                <div className="relative">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={user.name ?? "User"} width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-slate-700" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 text-slate-300 font-medium">{user.name?.[0] ?? "?"}</div>
                  )}
                  {onlineUsers.includes(user.clerkId ?? "") && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>}
                </div>
                <p className="font-semibold text-slate-200">{user.name || "Unknown User"}</p>
              </div>
            ))
          )
        ) : (
          recentConversations === undefined ? (
            <>
              <SidebarSkeleton />
              <SidebarSkeleton />
              <SidebarSkeleton />
              <SidebarSkeleton />
            </>
          ) : recentConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent chats. Search for a user to start messaging!</div>
          ) : (
            recentConversations.map((conv) => (
              <div key={conv._id} onClick={() => onSelectUser(conv.otherUser, conv._id)} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/80 cursor-pointer flex items-center gap-4 transition-all duration-200">
                <div className="relative shrink-0">
                  {conv.otherUser?.imageUrl ? (
                    <Image src={conv.otherUser.imageUrl} alt={conv.otherUser.name ?? "User"} width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-slate-700" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 text-slate-300 font-medium">{conv.otherUser?.name?.[0] ?? "?"}</div>
                  )}
                  {onlineUsers.includes(conv.otherUser?.clerkId ?? "") && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`font-semibold truncate ${conv.unreadCount > 0 ? "text-white" : "text-slate-200"}`}>{conv.otherUser?.name || "Unknown User"}</p>
                    {conv.lastMessage && (
                      <span className={`text-[10px] shrink-0 ml-2 ${conv.unreadCount > 0 ? "text-indigo-400 font-bold" : "text-slate-500"}`}>
                        {formatMessageTime(conv.lastMessage._creationTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-slate-300 font-medium" : "text-slate-400"}`}>
                      {conv.lastMessage ? (
                         conv.lastMessage.senderId === myUser?.id ? `You: ${conv.lastMessage.content}` : conv.lastMessage.content
                      ) : "Start a conversation..."}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}