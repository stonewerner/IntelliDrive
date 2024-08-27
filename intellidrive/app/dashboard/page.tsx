import React from 'react'
import { auth } from '@clerk/nextjs/server'
import Dropzone from '@/components/Dropzone'

function Dashboard() {
  const {userId} = auth();
  return (
    <div>
      <div>Dashboard</div>
      <Dropzone />
    </div>
  )
}

export default Dashboard