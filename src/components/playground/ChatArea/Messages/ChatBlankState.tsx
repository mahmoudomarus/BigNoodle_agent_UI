'use client'

import React from 'react'

const ChatBlankState = () => {
  return (
    <section
      className="flex h-full flex-col items-center justify-center text-center font-geist"
      aria-label="Welcome message"
    >
      <div className="flex max-w-md flex-col gap-y-4 p-4">
        <h2 className="text-xl font-medium text-muted">Enter your question below to get started</h2>
      </div>
    </section>
  )
}

export default ChatBlankState
