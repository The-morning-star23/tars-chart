import { mutation } from "./_generated/server";

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