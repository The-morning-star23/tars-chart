import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: {
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const myId = identity.subject;

    const conv1 = await ctx.db
      .query("conversations")
      .withIndex("by_participantOne", (q) =>
        q.eq("participantOne", myId).eq("participantTwo", args.otherUserId)
      )
      .unique();

    if (conv1) return conv1._id;

    const conv2 = await ctx.db
      .query("conversations")
      .withIndex("by_participantTwo", (q) =>
        q.eq("participantTwo", myId).eq("participantOne", args.otherUserId)
      )
      .unique();

    if (conv2) return conv2._id;

    const newConversationId = await ctx.db.insert("conversations", {
      participantOne: myId,
      participantTwo: args.otherUserId,
    });

    return newConversationId;
  },
});