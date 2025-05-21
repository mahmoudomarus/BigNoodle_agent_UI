import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import progressReducer from './progressSlice';

// Endpoint slice
interface EndpointState {
  selectedEndpoint: string;
}

const initialEndpointState: EndpointState = {
  selectedEndpoint: 'https://agno-agent-api-tabi-39e2dc704f77.herokuapp.com',
};

const endpointReducer = (state = initialEndpointState) => {
  return state;
};

// Agent slice
interface Agent {
  id: string;
  name: string;
  description: string;
}

interface AgentState {
  selectedAgent: Agent | null;
  agents: Agent[];
}

const initialAgentState: AgentState = {
  selectedAgent: {
    id: 'deep_research_agent',
    name: 'Deep Research Agent',
    description: 'Conducts comprehensive research on any topic',
  },
  agents: [
    {
      id: 'deep_research_agent',
      name: 'Deep Research Agent',
      description: 'Conducts comprehensive research on any topic',
    },
  ],
};

const agentReducer = (state = initialAgentState) => {
  return state;
};

// Root reducer
const rootReducer = combineReducers({
  endpoint: endpointReducer,
  agent: agentReducer,
  progress: progressReducer
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
});

// RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 