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
    <main className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      
      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Tars Chat</h2>
          <p className="text-gray-600">Please sign in to start chatting.</p>
        </div>
      </SignedOut>

      <SignedIn>
        <SyncUser />
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Hidden on mobile if a conversation is active */}
          <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-80 h-full shrink-0`}>
            <Sidebar onSelectUser={handleSelectUser} />
          </div>
          
          {/* Chat Area - Hidden on mobile if NO conversation is active */}
          <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
            {activeConversation && activeUser ? (
              <ChatArea 
                conversationId={activeConversation} 
                otherUser={activeUser} 
                onBack={handleBack} 
              />
            ) : (
              <div className="flex-1 flex-col items-center justify-center bg-gray-50 hidden md:flex">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-2xl">💬</span>
                </div>
                <h2 className="text-xl font-medium text-gray-700">Select a user to start chatting</h2>
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </main>
  );
}