'use client'

import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
import { ResearchComputer } from '../../ui/ResearchComputer';
import { RootState } from '../../../redux/store';

const ChatArea = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const selectedAgent = useSelector((state: RootState) => state.agent.selectedAgent);
  
  // Only show research computer for Deep Research Agent
  const showResearchComputer = selectedAgent?.name === 'Deep Research Agent' && sessionId;

  return (
    <main className="relative m-1.5 flex flex-grow flex-col rounded-xl bg-background">
      <MessageArea />
      <div className="sticky bottom-0 ml-9 px-4 pb-2">
        <ChatInput />
      </div>
      {showResearchComputer && <ResearchComputer sessionId={sessionId} />}
    </main>
  )
}

export default ChatArea
