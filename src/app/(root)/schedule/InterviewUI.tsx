import { useUser } from '@clerk/clerk-react'
import { useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useMutation, useQuery } from 'convex/react'
import React, { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import toast from 'react-hot-toast'
import { Loader2Icon, XIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { TIME_SLOTS } from '@/constants'
import UserInfo from '@/components/UserInfo'
import MeetingCard from '@/components/MeetingCard'

function InterviewUI() {
  const client = useStreamVideoClient()
  const { user } = useUser()


  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false);

  const interviews = useQuery(api.interview.getAllInterviews) ?? []
  const users = useQuery(api.users.getUsers) ?? []

  const createInterview = useMutation(api.interview.createInterview)

  const candidates = users?.filter((u) => u.role === "candidate")
  const interviewers = users?.filter((u) => u.role === "interviewer")


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    candidateId: "",
    interviewerIds: user?.id ? [user.id] : []
  })

  const scheduleInterview = async () => {
    if (!client || !user)
      return

    if (!formData.candidateId || formData.interviewerIds.length === 0) {
      toast.error("Please select candidate and at least one interviewer")
      return
    }

    setIsCreating(true)

    try {
      const { title, description, date, time, candidateId, interviewerIds } = formData;

      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);

      console.log(meetingDate)

      meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);


      const id = crypto.randomUUID()

      await createInterview({
        title,
        description,
        startTime: meetingDate.getTime(),
        candidateId,
        interviewerIds,
        status: "upcoming",
        streamCallId: id
      })

      setOpen(false)
      toast.success("Meeting scheduled successfully!")

      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : []
      })

    } catch (error) {
      console.error(error)
      toast.error("Failed to schedule meeting. please try again.");
    }
    finally {
      setIsCreating(false)
    }
  }

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((pre) => ({
        ...pre,
        interviewerIds: [...pre.interviewerIds, interviewerId]
      }))
    }
  }

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return

    setFormData((pre) => ({
      ...pre,
      interviewerIds: pre.interviewerIds.filter((id) => id !== interviewerId)
    }))
  }


  const selectedInterviewers = interviewers.filter((i) => formData.interviewerIds.includes(i.clerk_id));

  const availableInterviewers = interviewers.filter((i) => !formData.interviewerIds.includes(i.clerk_id));



  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        {/* HEADER INFO */}
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage interviews</p>
        </div>

        {/* DIALOG */}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">Schedule Interview</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] h-[calc(100vh-200px)] overflow-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">

              <div className="space-y-2">
                <label className="text-sm font-medium mb-2">Title</label>
                <Input
                  placeholder="Interview title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Interview description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Candidate</label>
                <Select
                  value={formData.candidateId}
                  onValueChange={(candidateId) => setFormData({ ...formData, candidateId })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.clerk_id} value={candidate.clerk_id}>
                        <UserInfo user={candidate} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

          
              <div className="space-y-2">
                <label className="text-sm font-medium">Interviewers</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.clerk_id}
                      className="inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <UserInfo user={interviewer} />
                      {interviewer.clerk_id !== user?.id && (
                        <button
                          onClick={() => removeInterviewer(interviewer.clerk_id)}
                          className="hover:text-destructive transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {availableInterviewers.length > 0 && (
                  <Select onValueChange={addInterviewer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInterviewers.map((interviewer) => (
                        <SelectItem key={interviewer.clerk_id} value={interviewer.clerk_id}>
                          <UserInfo user={interviewer} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

        
              <div className="flex gap-4">
              
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

          

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Select
                    value={formData.time}
                    onValueChange={(time) => setFormData({ ...formData, time })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

          
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={scheduleInterview} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Interview"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!interviews ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : interviews.length > 0 ? (
        <div className="spacey-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <MeetingCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No interviews scheduled</div>
      )}
    </div>
  )
}

export default InterviewUI