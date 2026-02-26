"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export default function SyncUser() {
  const storeUser = useMutation(api.users.store);
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    // Only run the mutation when Convex is fully done loading AND authenticated
    if (isAuthenticated && !isLoading) {
      storeUser().catch(console.error);
    }
  }, [isAuthenticated, isLoading, storeUser]);

  return null;
}