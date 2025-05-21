'use client'
import { Button } from '@/components/ui/button'
import { AgentSelector } from '@/components/playground/Sidebar/AgentSelector'
import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '@/store'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import Sessions from './Sessions'
import { useQueryState } from 'nuqs'
import { truncateText } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
const ENDPOINT_PLACEHOLDER = 'NO ENDPOINT ADDED'
const SidebarHeader = () => (
  <div className="flex items-center gap-2">
    <Icon type="bignoodle" size="xs" />
    <span className="text-xs font-medium uppercase text-white">BigNoodle Agent</span>
  </div>
)

const NewChatButton = ({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => void
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    size="lg"
    className="h-9 w-full rounded-xl bg-primary text-xs font-medium text-background hover:bg-primary/80"
  >
    <Icon type="plus-icon" size="xs" className="text-background" />
    <span className="uppercase">New Chat</span>
  </Button>
)

const ModelDisplay = ({ model }: { model: string }) => (
  <div className="flex h-9 w-full items-center gap-3 rounded-xl border border-primary/15 bg-accent p-3 text-xs font-medium uppercase text-muted">
    {(() => {
      const icon = getProviderIcon(model)
      return icon ? <Icon type={icon} className="shrink-0" size="xs" /> : null
    })()}
    {model}
  </div>
)

const Endpoint = () => {
  const {
    selectedEndpoint,
    isEndpointActive
  } = usePlaygroundStore()
  const { initializePlayground } = useChatActions()
  const [isMounted, setIsMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [selectedEndpoint])

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-positive' : 'bg-destructive'

  const handleRefresh = async () => {
    setIsRotating(true)
    await initializePlayground()
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-xs font-medium uppercase text-primary">Endpoint</div>
      <div className="flex w-full items-center gap-1">
        <div
          className="relative flex h-9 w-full items-center justify-between rounded-xl border border-primary/15 bg-accent p-3 uppercase"
        >
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <p className="text-xs font-medium text-muted">
              {isMounted
                ? truncateText(selectedEndpoint, 21) ||
                  ENDPOINT_PLACEHOLDER
                : selectedEndpoint}
            </p>
            <div
              className={`size-2 shrink-0 rounded-full ${getStatusColor(isEndpointActive)}`}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="hover:cursor-pointer hover:bg-transparent"
        >
          <motion.div
            key={isRotating ? 'rotating' : 'idle'}
            animate={{ rotate: isRotating ? 360 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Icon type="refresh" size="xs" />
          </motion.div>
        </Button>
      </div>
    </div>
  )
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { clearChat, focusChatInput, initializePlayground } = useChatActions()
  const {
    messages,
    selectedEndpoint,
    isEndpointActive,
    selectedModel,
    hydrated,
    isEndpointLoading
  } = usePlaygroundStore()
  const [isMounted, setIsMounted] = useState(false)
  const [agentId] = useQueryState('agent')
  useEffect(() => {
    setIsMounted(true)
    if (hydrated) initializePlayground()
  }, [selectedEndpoint, initializePlayground, hydrated])
  const handleNewChat = () => {
    clearChat()
    focusChatInput()
  }
  return (
    <motion.aside
      className="relative flex h-screen shrink-0 grow-0 flex-col overflow-hidden px-2 py-3 font-dmmono"
      initial={{ width: '16rem' }}
      animate={{ width: isCollapsed ? '2.5rem' : '16rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-2 z-10 p-1"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <Icon
          type="sheet"
          size="xs"
          className={`transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
        />
      </motion.button>
      <motion.div
        className="w-60 space-y-5"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          pointerEvents: isCollapsed ? 'none' : 'auto'
        }}
      >
        <SidebarHeader />
        <NewChatButton
          disabled={messages.length === 0}
          onClick={handleNewChat}
        />
        {isMounted && (
          <>
            <Endpoint />
            {isEndpointActive && (
              <>
                <motion.div
                  className="flex w-full flex-col items-start gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="text-xs font-medium uppercase text-primary">
                    Agent
                  </div>
                  {isEndpointLoading ? (
                    <div className="flex w-full flex-col gap-2">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-9 w-full rounded-xl"
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <AgentSelector />
                      {selectedModel && agentId && (
                        <ModelDisplay model={selectedModel} />
                      )}
                    </>
                  )}
                </motion.div>
                <Sessions />
              </>
            )}
          </>
        )}
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar
