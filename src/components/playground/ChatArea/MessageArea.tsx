'use client'

import { usePlaygroundStore } from '@/store'
import Messages from './Messages'
import ScrollToBottom from '@/components/playground/ChatArea/ScrollToBottom'
import { StickToBottom } from 'use-stick-to-bottom'
import ResearchProgress from './Messages/ResearchProgress'
import { useState, useEffect } from 'react'

const MessageArea = () => {
  const { messages } = usePlaygroundStore()
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Extract session_id from agent messages for research tasks
  useEffect(() => {
    const latestAgentMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'agent' && msg.content?.includes('session_id'));
      
    if (latestAgentMessage) {
      try {
        // Try to find session_id in the message content
        const match = latestAgentMessage.content.match(/session_id["|']?:\s*["|']?([a-zA-Z0-9-]+)["|']?/);
        if (match && match[1]) {
          setSessionId(match[1]);
        }
      } catch (e) {
        console.error('Error extracting session_id:', e);
      }
    }
  }, [messages]);

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
