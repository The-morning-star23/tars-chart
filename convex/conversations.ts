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
    if (conv1 && !conv1.isGroup) return conv1._id;

    const conv2 = await ctx.db
      .query("conversations")
      .withIndex("by_participantTwo", (q) => q.eq("participantTwo", myId).eq("participantOne", args.otherUserId))
      .unique();
    if (conv2 && !conv2.isGroup) return conv2._id;

    return await ctx.db.insert("conversations", { 
      participantOne: myId, 
      participantTwo: args.otherUserId,
      isGroup: false 
    });
  },
});

// NEW: Mutation to create a group chat
export const createGroup = mutation({
  args: { 
    name: v.string(), 
    members: v.array(v.string()) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Add the creator to the member list automatically
    const allMembers = [...args.members, identity.subject];
    
    return await ctx.db.insert("conversations", {
      isGroup: true,
      groupName: args.name,
      groupMembers: allMembers,
    });
  }
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myId = identity.subject;

    // 1. Fetch 1-on-1 conversations
    const conv1 = await ctx.db.query("conversations").withIndex("by_participantOne", (q) => q.eq("participantOne", myId)).collect();
    const conv2 = await ctx.db.query("conversations").withIndex("by_participantTwo", (q) => q.eq("participantTwo", myId)).collect();
    
    // 2. Fetch Group conversations (we filter in memory since Convex doesn't index arrays directly yet)
    const allGroups = await ctx.db.query("conversations").filter(q => q.eq(q.field("isGroup"), true)).collect();
    const myGroups = allGroups.filter(g => g.groupMembers?.includes(myId));

    const allConversations = [...conv1, ...conv2, ...myGroups];

    const result = await Promise.all(
      allConversations.map(async (conv) => {
        let otherUser = null;
        
        // Only fetch the "other user" profile if it's a 1-on-1 chat
        if (!conv.isGroup) {
          const otherUserId = conv.participantOne === myId ? conv.participantTwo : conv.participantOne;
          if (otherUserId) {
             otherUser = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", otherUserId)).unique();
          }
        }

        const messages = await ctx.db.query("messages").withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id)).order("desc").take(1);
        const lastMessage = messages[0];

        const receipt = await ctx.db.query("readReceipts").withIndex("by_user_and_conversation", (q) => q.eq("userId", myId).eq("conversationId", conv._id)).unique();
        const lastReadTime = receipt ? receipt.lastReadTime : 0;
        
        const allMsgs = await ctx.db.query("messages").withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id)).collect();
        const unreadCount = allMsgs.filter(m => m.senderId !== myId && m._creationTime > lastReadTime).length;

        return {
          _id: conv._id,
          isGroup: conv.isGroup || false,
          groupName: conv.groupName,
          groupMembers: conv.groupMembers,
          otherUser, // Will be null for groups
          lastMessage,
          unreadCount,
          updatedAt: lastMessage ? lastMessage._creationTime : conv._creationTime,
        };
      })
    );

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