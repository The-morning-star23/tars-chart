import Navbar from "@/components/Navbar";
import SyncUser from "@/components/SyncUser";
import Sidebar from "@/components/Sidebar";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
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
          <Sidebar />
          
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-500 text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a user to start chatting</h2>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}