import { useCallback } from 'react'

import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '../store'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'
import { useQueryState } from 'nuqs'

/**
 * useAIChatStreamHandler is responsible for making API calls and handling the stream response.
 * For now, it only streams message content and updates the messages state.
 */
const useAIChatStreamHandler = () => {
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const { addMessage, focusChatInput } = useChatActions()
  const [agentId] = useQueryState('agent')
  const [sessionId] = useQueryState('session')
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const setStreamingErrorMessage = usePlaygroundStore(
    (state) => state.setStreamingErrorMessage
  )
  const setIsStreaming = usePlaygroundStore((state) => state.setIsStreaming)

  const handleStreamingResponse = useCallback(
    async (input: string | FormData) => {
      setIsStreaming(true)

      const formData = input instanceof FormData ? input : new FormData()
      if (typeof input === 'string') {
        formData.append('message', input)
      }

      setMessages((prevMessages) => {
        if (prevMessages.length >= 2) {
          const lastMessage = prevMessages[prevMessages.length - 1]
          const secondLastMessage = prevMessages[prevMessages.length - 2]
          if (
            lastMessage.role === 'agent' &&
            lastMessage.streamingError &&
            secondLastMessage.role === 'user'
          ) {
            return prevMessages.slice(0, -2)
          }
        }
        return prevMessages
      })

      addMessage({
        role: 'user',
        content: formData.get('message') as string,
        created_at: Math.floor(Date.now() / 1000)
      })

      addMessage({
        role: 'agent',
        content: '',
        tool_calls: [],
        streamingError: false,
        created_at: Math.floor(Date.now() / 1000) + 1
      })

      try {
        const endpointUrl = constructEndpointUrl(selectedEndpoint)

        if (!agentId) return
        
        // Use the working simple-chat endpoint instead of broken agent runs
        const playgroundRunUrl = `${endpointUrl}/v1/agents/simple-chat`

        // Convert FormData to JSON for simple-chat endpoint
        const message = formData.get('message') as string
        const requestBody = {
          message: message,
          session_id: sessionId ?? ''
        }

        // For simple-chat endpoint, make a simple POST request instead of streaming
        const response = await fetch(playgroundRunUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
        
        const result = await response.json()
        
        // Handle the response from simple-chat endpoint
        if (result.success) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              role: 'agent' as const,
              content: result.response,
              created_at: Date.now(),
              tool_calls: []
            }
          ])
        } else {
          setStreamingErrorMessage(result.response || 'Error generating response')
        }
        
      } catch (error) {
        setStreamingErrorMessage(
          error instanceof Error ? error.message : String(error)
        )
      } finally {
        setIsStreaming(false)
        focusChatInput()
      }
    },
    [
      setMessages,
      addMessage,
      setIsStreaming,
      setStreamingErrorMessage,
      focusChatInput,
      selectedEndpoint,
      agentId,
      sessionId
    ]
  )

  return {
    handleStreamingResponse
  }
}

export default useAIChatStreamHandler
