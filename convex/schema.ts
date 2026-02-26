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
  }).index("by_conversationId", ["conversationId"]),
});