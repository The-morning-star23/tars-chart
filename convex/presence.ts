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

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
    } else {
      await ctx.db.insert("presence", { userId: identity.subject, updatedAt: Date.now() });
    }
  }
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    // A user is "online" if their heartbeat was within the last 30 seconds
    const threshold = Date.now() - 30000;
    const active = await ctx.db.query("presence").filter(q => q.gt(q.field("updatedAt"), threshold)).collect();
    
    return active.map(p => p.userId);
  }
});