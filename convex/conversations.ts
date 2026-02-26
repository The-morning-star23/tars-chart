import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { otherUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const myId = identity.subject;

    const conv1 = await ctx.db
      .query("conversations")
      .withIndex("by_participantOne", (q) => q.eq("participantOne", myId).eq("participantTwo", args.otherUserId))
      .unique();
    if (conv1) return conv1._id;

    const conv2 = await ctx.db
      .query("conversations")
      .withIndex("by_participantTwo", (q) => q.eq("participantTwo", myId).eq("participantOne", args.otherUserId))
      .unique();
    if (conv2) return conv2._id;

    return await ctx.db.insert("conversations", { participantOne: myId, participantTwo: args.otherUserId });
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myId = identity.subject;

    // Fetch conversations where I am either participant 1 or 2
    const conv1 = await ctx.db.query("conversations").withIndex("by_participantOne", (q) => q.eq("participantOne", myId)).collect();
    const conv2 = await ctx.db.query("conversations").withIndex("by_participantTwo", (q) => q.eq("participantTwo", myId)).collect();
    const allConversations = [...conv1, ...conv2];

    const result = await Promise.all(
      allConversations.map(async (conv) => {
        const otherUserId = conv.participantOne === myId ? conv.participantTwo : conv.participantOne;
        const otherUser = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", otherUserId)).unique();

        // Get the last message for the preview
        const messages = await ctx.db.query("messages").withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id)).order("desc").take(1);
        const lastMessage = messages[0];

        // Calculate unread count
        const receipt = await ctx.db.query("readReceipts").withIndex("by_user_and_conversation", (q) => q.eq("userId", myId).eq("conversationId", conv._id)).unique();
        const lastReadTime = receipt ? receipt.lastReadTime : 0;
        
        const allMsgs = await ctx.db.query("messages").withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id)).collect();
        const unreadCount = allMsgs.filter(m => m.senderId !== myId && m._creationTime > lastReadTime).length;

        return {
          _id: conv._id,
          otherUser,
          lastMessage,
          unreadCount,
          updatedAt: lastMessage ? lastMessage._creationTime : conv._creationTime,
        };
      })
    );

    // Sort by most recently active
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const myId = identity.subject;

    const existing = await ctx.db.query("readReceipts").withIndex("by_user_and_conversation", (q) => q.eq("userId", myId).eq("conversationId", args.conversationId)).unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readReceipts", { userId: myId, conversationId: args.conversationId, lastReadTime: Date.now() });
    }
  }
});