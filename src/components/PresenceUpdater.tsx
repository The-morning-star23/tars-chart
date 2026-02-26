"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function PresenceUpdater() {
  const heartbeat = useMutation(api.presence.heartbeat);

  useEffect(() => {
    // Ping immediately when the app loads
    heartbeat().catch(console.error);

    // Then ping every 15 seconds
    const interval = setInterval(() => {
      heartbeat().catch(console.error);
    }, 15000);

    return () => clearInterval(interval);
  }, [heartbeat]);

  return null; // This component is invisible
}