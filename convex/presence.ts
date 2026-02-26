import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
    } else {
      await ctx.db.insert("presence", { userId: identity.subject, updatedAt: now });
    }
  }
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("presence").collect();
    const now = Date.now();
    // A user is considered online if their last heartbeat was within the last 30 seconds
    return users.filter(u => now - u.updatedAt < 30000).map(u => u.userId);
  }
});