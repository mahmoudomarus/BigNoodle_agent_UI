'use client'

import { usePlaygroundStore } from '@/store'
import Messages from './Messages'
import { ResearchProgress } from './Messages'
import ScrollToBottom from '@/components/playground/ChatArea/ScrollToBottom'
import { StickToBottom } from 'use-stick-to-bottom'
import { useEffect, useState } from 'react'

const MessageArea = () => {
  const { messages } = usePlaygroundStore()
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Extract session ID from messages that contain research results
  useEffect(() => {
    if (!messages || messages.length === 0) return
    
    // Look for the session_id in the message content
    const researchMessages = messages.filter(msg => 
      msg.role === 'agent' && 
      typeof msg.content === 'string' && 
      msg.content.includes('session_id')
    )
    
    if (researchMessages.length > 0) {
      try {
        // Try to extract the session_id from the message content
        const lastMessage = researchMessages[researchMessages.length - 1].content
        const match = /session_id["']?\s*:\s*["']([^"']+)["']/i.exec(lastMessage as string)
        if (match && match[1]) {
          setSessionId(match[1])
        }
      } catch (error) {
        console.error('Failed to parse session ID:', error)
      }
    }
  }, [messages])

  return (
    <StickToBottom
      className="relative mb-4 flex max-h-[calc(100vh-64px)] min-h-0 flex-grow flex-col"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-2xl space-y-9 px-4 pb-4">
          {sessionId && <ResearchProgress sessionId={sessionId} />}
          <Messages messages={messages} />
        </div>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  )
}

export default MessageArea
