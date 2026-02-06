"use client"

import InterviewUI from '@/app/(root)/schedule/InterviewUI'
import LoaderUI from '@/components/LoaderUI'
import { useUserRole } from '@/hooks/useUserRole'
import { useRouter } from 'next/navigation'
import React from 'react'

function SchedulePage() {

  const router=useRouter()
  const {isInterviewer,isLoading}=useUserRole()

  if(isLoading)
    return <LoaderUI/>

  if(!isInterviewer)
      router.push('/');

  return (
    <InterviewUI/>
  )
}

export default SchedulePage