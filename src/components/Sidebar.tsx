/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

export default function Sidebar({ onSelectUser }: { onSelectUser: (user: any, conversationId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.getUsers, { searchTerm });
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

  const handleUserClick = async (user: any) => {
    const conversationId = await getOrCreateConversation({ otherUserId: user.clerkId });
    onSelectUser(user, conversationId);
  };

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
        {users === undefined ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No users found.</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="p-4 border-b border-slate-800/50 hover:bg-slate-800/80 cursor-pointer flex items-center gap-4 transition-all duration-200"
              onClick={() => handleUserClick(user)}
            >
              {user.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt={user.name ?? "User"} 
                  width={44} 
                  height={44} 
                  className="w-11 h-11 rounded-full ring-2 ring-slate-700" 
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 text-slate-300 font-medium">
                  {user.name?.[0] ?? "?"}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-200">{user.name || "Unknown User"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}