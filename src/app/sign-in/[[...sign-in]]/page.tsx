import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 relative">
      {/* Background pattern to match the chat area */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>
      
      <SignIn 
        appearance={{ 
          baseTheme: dark,
          variables: { 
            colorPrimary: '#4f46e5', // Matches your indigo-600 buttons
            colorBackground: '#0f172a', // Matches your slate-900 UI
          } 
        }} 
      />
    </div>
  );
}