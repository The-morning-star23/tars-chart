import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participantOne: v.string(),
    participantTwo: v.string(),
  })
    .index("by_participantOne", ["participantOne", "participantTwo"])
    .index("by_participantTwo", ["participantTwo", "participantOne"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    isDeleted: v.optional(v.boolean()),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.string(),
    }))),
  }).index("by_conversationId", ["conversationId"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
  }).index("by_conversation_and_user", ["conversationId", "userId"]),

  presence: defineTable({
    userId: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  readReceipts: defineTable({
    userId: v.string(),
    conversationId: v.id("conversations"),
    lastReadTime: v.number(),
  }).index("by_user_and_conversation", ["userId", "conversationId"]),
});