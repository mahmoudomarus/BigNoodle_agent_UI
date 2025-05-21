import { APIRoutes } from './routes';

// Types for research progress
export interface ProgressSource {
  text: string;
  url: string | null;
}

export interface ResearchProgress {
  session_id: string;
  status: string;
  step: string;
  step_number: number;
  total_steps: number;
  percentage: number;
  search_queries: string[];
  sources: ProgressSource[];
  status_updates: string[];
  start_time: number;
  complete: boolean;
}

// Research request interface
export interface ResearchRequest {
  question: string;
  model_id?: string;
  additional_instructions?: string;
}

// API Routes for research
export const startResearchAPI = async (
  base: string,
  request: ResearchRequest
): Promise<{ session_id: string; message: string }> => {
  const response = await fetch(APIRoutes.DeepResearch(base), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Failed to start research: ${response.statusText}`);
  }

  return response.json();
};

// Get research progress by polling (fallback if WebSocket is not available)
export const getResearchProgressAPI = async (
  base: string,
  sessionId: string
): Promise<ResearchProgress> => {
  const response = await fetch(APIRoutes.ResearchProgress(base, sessionId), {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Failed to get research progress: ${response.statusText}`);
  }

  return response.json();
};

// Create WebSocket connection for real-time progress updates
export const createResearchProgressWebSocket = (
  base: string,
  sessionId: string,
  onMessage: (data: ResearchProgress) => void,
  onError: (error: Event) => void,
  onClose: () => void
): WebSocket => {
  // Convert http/https to ws/wss
  const wsBase = base.replace('http://', 'ws://').replace('https://', 'wss://');
  const wsUrl = APIRoutes.ResearchProgressWebSocket(wsBase, sessionId);
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onerror = onError;
  ws.onclose = () => {
    onClose();
  };

  return ws;
};

// Get active research sessions
export const getActiveResearchSessionsAPI = async (
  base: string
): Promise<string[]> => {
  const response = await fetch(APIRoutes.ActiveResearchSessions(base), {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Failed to get active sessions: ${response.statusText}`);
  }

  return response.json();
}; 