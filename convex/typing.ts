import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", identity.subject)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isTyping: args.isTyping });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: identity.subject,
        isTyping: args.isTyping,
      });
    }
  },
});

export const getStatus = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const statuses = await ctx.db
      .query("typing")
      .withIndex("by_conversation_and_user", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return statuses.filter((s) => s.userId !== identity.subject && s.isTyping);
  },
});