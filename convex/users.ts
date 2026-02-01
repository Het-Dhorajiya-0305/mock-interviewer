import { v } from "convex/values";
import { mutation, query } from "./_generated/server";  

export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const existedUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerk_id"), args.clerkId))
            .first();

        if (existedUser) return;

        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            image: args.image,
            clerk_id: args.clerkId,
            role: "candidate",
        });
    },
});


export const getUsers=query({
    handler:async (ctx)=>{
        const identity=await ctx.auth.getUserIdentity()

        if(!identity)
            throw new Error("User is not authenticated")

        const user=await ctx.db.query("users").collect()

        return user
    }
})

export const getUserByClerkId=query({
    args:{
        clerk_id:v.string()
    },
    handler:async(ctx,args)=>{

        const user=await ctx.db.query("users").withIndex("by_clerk_id",(q=>q.eq("clerk_id",args.clerk_id))).first();

        return user
    }
})