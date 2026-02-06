import React from 'react'
import { Doc } from "../../convex/_generated/dataModel";
import useMeetingAction from '@/hooks/useMeetingAction';
import { getMeetingStatus } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type Interview = Doc<"interviews">;



function MeetingCard({ interview }: { interview: Interview }) {
    const { createMeeting } = useMeetingAction()

    const meetingStatus = getMeetingStatus(interview);
    const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

    const handleStart = () => {
        createMeeting(interview.streamCallId)
    }

    return (
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        {formattedDate}
                    </div>

                    <Badge
                        variant={
                            meetingStatus === "live" ? "default" : meetingStatus === "upcoming" ? "secondary" : "outline"
                        }
                    >
                        {meetingStatus === "live" ? "Live Now" : meetingStatus === "upcoming" ? "Upcoming" : "Completed"}
                    </Badge>
                </div>

                <CardTitle>{interview.title}</CardTitle>

                {interview.description && (
                    <CardDescription className="line-clamp-2">{interview.description}</CardDescription>
                )}
            </CardHeader>

            <CardContent>
                {meetingStatus === "live" && (
                    <Button className="w-full" onClick={handleStart}>
                        Join Meeting
                    </Button>
                )}

                {meetingStatus === "upcoming" && (
                    <Button variant="outline" className="w-full" disabled>
                        Waiting to Start
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default MeetingCard