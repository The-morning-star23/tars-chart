/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { formatMessageTime } from "@/lib/formatTime";
import { useUser } from "@clerk/nextjs";

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
  
  // Group Modal State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const users = useQuery(api.users.getUsers, { searchTerm: isCreatingGroup ? "" : searchTerm });
  const recentConversations = useQuery(api.conversations.getMyConversations);
  
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);
  const createGroupMutation = useMutation(api.conversations.createGroup);
  const onlineUsers = useQuery(api.presence.getOnlineUsers) || [];

  // NEW: Presence Heartbeat
  const heartbeat = useMutation(api.presence.heartbeat);
  useEffect(() => {
    // Ping backend every 10 seconds to say "I'm online!"
    const interval = setInterval(() => {
      heartbeat().catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [heartbeat]);

  const handleUserClick = async (user: any) => {
    const conversationId = await getOrCreateConversation({ otherUserId: user.clerkId });
    onSelectUser(user, conversationId);
    setSearchTerm("");
  };

  const handleGroupClick = (conv: any) => {
    // We pass a "faux" user object so ChatArea doesn't break
    const groupUser = {
      clerkId: `group_${conv._id}`,
      name: conv.groupName,
      imageUrl: null,
      isGroup: true,
      memberCount: conv.groupMembers?.length || 0
    };
    onSelectUser(groupUser, conv._id);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    
    const conversationId = await createGroupMutation({
      name: groupName.trim(),
      members: selectedMembers,
    });
    
    // Automatically open the new group
    const groupUser = { clerkId: `group_${conversationId}`, name: groupName.trim(), imageUrl: null, isGroup: true, memberCount: selectedMembers.length + 1 };
    onSelectUser(groupUser, conversationId);
    
    // Reset modal
    setIsCreatingGroup(false);
    setGroupName("");
    setSelectedMembers([]);
  };

  const toggleMember = (clerkId: string) => {
    setSelectedMembers(prev => 
      prev.includes(clerkId) ? prev.filter(id => id !== clerkId) : [...prev, clerkId]
    );
  };

  const isSearching = searchTerm.trim().length > 0 && !isCreatingGroup;

  return (
    <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900 flex flex-col h-full shrink-0 relative">
      <div className="p-4 border-b border-slate-800 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 placeholder-slate-500 transition-all shadow-inner"
          />
        </div>
        <button 
          onClick={() => setIsCreatingGroup(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-11 h-11 rounded-xl flex items-center justify-center border border-slate-700 transition-colors shadow-sm"
          title="Create Group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreatingGroup && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h3 className="font-bold text-slate-100">New Group</h3>
            <button onClick={() => setIsCreatingGroup(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="p-4 border-b border-slate-800 bg-slate-900">
            <input
              type="text"
              placeholder="Group Name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            <p className="text-xs font-semibold text-slate-500 px-2 pt-2 pb-1 uppercase tracking-wider">Select Members</p>
            {users?.map((user) => (
              <div 
                key={user._id} 
                onClick={() => toggleMember(user.clerkId)}
                className="p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={user.name ?? "User"} width={36} height={36} className="w-9 h-9 rounded-full ring-1 ring-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-medium">{user.name?.[0] ?? "?"}</div>
                  )}
                  <span className="text-slate-200 font-medium">{user.name}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMembers.includes(user.clerkId) ? "bg-indigo-500 border-indigo-500" : "border-slate-600"}`}>
                  {selectedMembers.includes(user.clerkId) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className="w-full bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Create Group ({selectedMembers.length})
            </button>
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isSearching ? (
          users === undefined ? (
            <><SidebarSkeleton /><SidebarSkeleton /><SidebarSkeleton /></>
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
            <><SidebarSkeleton /><SidebarSkeleton /><SidebarSkeleton /><SidebarSkeleton /></>
          ) : recentConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent chats. Search for a user or create a group to start messaging!</div>
          ) : (
            recentConversations.map((conv) => (
              <div 
                key={conv._id} 
                onClick={() => conv.isGroup ? handleGroupClick(conv) : onSelectUser(conv.otherUser, conv._id)} 
                className="p-4 border-b border-slate-800/50 hover:bg-slate-800/80 cursor-pointer flex items-center gap-4 transition-all duration-200"
              >
                <div className="relative shrink-0">
                  {conv.isGroup ? (
                    <div className="w-11 h-11 rounded-full bg-indigo-900/50 flex items-center justify-center ring-2 ring-indigo-500/30 text-indigo-300 font-bold border border-indigo-700/50 shadow-inner">
                      {conv.groupName?.[0]?.toUpperCase() ?? "G"}
                    </div>
                  ) : conv.otherUser?.imageUrl ? (
                    <Image src={conv.otherUser.imageUrl} alt={conv.otherUser.name ?? "User"} width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-slate-700" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 text-slate-300 font-medium">{conv.otherUser?.name?.[0] ?? "?"}</div>
                  )}
                  {!conv.isGroup && onlineUsers.includes(conv.otherUser?.clerkId ?? "") && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`font-semibold truncate ${conv.unreadCount > 0 ? "text-white" : "text-slate-200"}`}>
                      {conv.isGroup ? conv.groupName : (conv.otherUser?.name || "Unknown User")}
                    </p>
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