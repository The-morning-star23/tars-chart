"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.getUsers, { searchTerm });

  return (
    <div className="w-full md:w-80 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {users === undefined ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found.</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-3"
              onClick={() => console.log("Clicked user", user.name)}
            >
              {user.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt={user.name ?? "User"} 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-full" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.name?.[0] ?? "?"}
                </div>
              )}
              <div>
                <p className="font-medium">{user.name || "Unknown User"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}