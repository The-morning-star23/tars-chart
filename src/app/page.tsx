/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SyncUser from "@/components/SyncUser";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  const handleSelectUser = (user: any, conversationId: string) => {
    setActiveUser(user);
    setActiveConversation(conversationId as Id<"conversations">);
  };

  const handleBack = () => {
    setActiveConversation(null);
    setActiveUser(null);
  };

  return (
    <main className="h-dvh bg-slate-950 flex flex-col overflow-hidden text-slate-200 font-sans">
      <Navbar />
      
      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 border border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-indigo-500 text-5xl">💬</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">Welcome to Tars Chat</h2>
          <p className="text-slate-400 text-lg max-w-md text-center">A secure, real-time messaging experience. Please sign in to connect with others.</p>
        </div>
      </SignedOut>

      <SignedIn>
        <SyncUser />
        <div className="flex-1 flex overflow-hidden">
          <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-80 h-full shrink-0`}>
            <Sidebar onSelectUser={handleSelectUser} />
          </div>
          
          <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
            {activeConversation && activeUser ? (
              <ChatArea 
                conversationId={activeConversation} 
                otherUser={activeUser} 
                onBack={handleBack} 
              />
            ) : (
              <div className="flex-1 flex-col items-center justify-center bg-slate-950 hidden md:flex">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 border border-slate-800">
                  <span className="text-indigo-400 text-3xl">👋</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-300 mb-2">Select a user to start chatting</h2>
                <p className="text-slate-500">Choose a conversation from the sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </main>
  );
}