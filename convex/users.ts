import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Securely get the logged-in user's Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // 2. Check if we've already saved this user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user !== null) {
      // If the user exists but changed their name/avatar in Clerk, update it!
      if (user.name !== identity.name || user.imageUrl !== identity.pictureUrl) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          imageUrl: identity.pictureUrl,
        });
      }
      return user._id;
    }

    // 3. If it's a completely new user, insert them into the database
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email!,
      imageUrl: identity.pictureUrl,
      clerkId: identity.subject,
    });
  },
});

export const getUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty if not logged in
    }

    // 2. Fetch all users from the database
    const users = await ctx.db.query("users").collect();

    // 3. Filter the users
    return users.filter((user) => {
      // Exclude the current logged-in user
      if (user.clerkId === identity.subject) return false;

      // Filter by search term if one was provided
      if (args.searchTerm) {
        return user.name?.toLowerCase().includes(args.searchTerm.toLowerCase());
      }

      return true;
    });
  },
});