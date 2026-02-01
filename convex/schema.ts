import {defineSchema, defineTable} from 'convex/server'
import { v } from 'convex/values'


export default defineSchema({
    users:defineTable({
        name:v.string(),
        email:v.string(),
        image:v.optional(v.string()), 
        role:v.union(v.literal("candidate"),v.literal("interviewer")),
        clerk_id:v.string()
    }).index("by_clerk_id",["clerk_id"]),

    interviews:defineTable({
        title:v.string(),
        description:v.optional(v.string()),
        startTime:v.number(),
        endTime:v.optional(v.number()),
        status:v.string(),
        streamCallId:v.string(),
        interviewerId:v.array(v.string()),   
        candidateId:v.string() 
    }).index("by_candidate_id",["candidateId"]).index("by_stream_call_id",["streamCallId"]),

    comments:defineTable({
        content:v.string(),
        rating:v.number(),
        interviewerId:v.string(),
        interviewId:v.id("interviews")
    }).index("by_interview_id",["interviewId"])
})
