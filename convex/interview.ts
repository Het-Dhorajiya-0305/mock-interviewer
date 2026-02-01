import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


const getAllInterviews = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity)
            throw new Error("Unauthorized User!")

        const interviews = await ctx.db.query("interviews").collect();

        return interviews;
    }
})


const getUserInterviews = query({
    handler: async (ctx) => {

        const identity = await ctx.auth.getUserIdentity()


        if (!identity)
            return [];


        const interviews = await ctx.db.query("interviews").withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject)).collect()

        return interviews
    }
})


const getInterviewByStreamCallId = query({
    args: {
        streamCallid: v.string()
    },
    handler: async (ctx, args) => {
        const interviews = await ctx.db.query("interviews").withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallid)).first();

        return interviews;
    }
})


const createInterview = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        startTime: v.number(),
        status: v.string(),
        streamCallId: v.string(),
        interviewerId: v.array(v.string()),
        candidateId: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity)
            throw new Error("Unauthorized User")

        return await ctx.db.insert("interviews", {
            title: args.title,
            description: args.description,
            startTime: args.startTime,
            status: args.status,
            streamCallId: args.streamCallId,
            interviewerId: args.interviewerId,
            candidateId: args.candidateId
        })
    }
})


const updateInterviewStatus = mutation({
    args: {
        id: v.id("interviews"),
        status: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity)
            throw new Error("Unauthorized User")

        return await ctx.db.patch(args.id, {
            status: args.status,
            ...(args.status === "completed" ? { endTime: Date.now() } : {})
        })
    }
})

export {getAllInterviews,getInterviewByStreamCallId,getUserInterviews,createInterview,updateInterviewStatus}