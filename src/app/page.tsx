import Navbar from "@/components/Navbar";
import SyncUser from "@/components/SyncUser";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <SignedOut>
          <h2 className="text-2xl font-semibold mb-2">Welcome to Tars Chat</h2>
          <p className="text-gray-600">Please sign in to start chatting.</p>
        </SignedOut>

        <SignedIn>
          <SyncUser />
          <h2 className="text-2xl font-semibold mb-2">You are logged in!</h2>
          <p className="text-gray-600">Your profile has been synced to the Convex database.</p>
        </SignedIn>
      </div>
    </main>
  );
}