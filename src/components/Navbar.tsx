import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-md">
      <h1 className="text-2xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
        Tars Chat
      </h1>
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/30">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="ring-2 ring-slate-700 rounded-full p-0.5">
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}