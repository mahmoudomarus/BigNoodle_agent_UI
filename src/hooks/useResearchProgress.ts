import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ResearchProgress, 
  createResearchProgressWebSocket, 
  getResearchProgressAPI 
} from '../api/research';

interface UseResearchProgressProps {
  apiBaseUrl: string;
  sessionId: string | null;
  pollingInterval?: number; // Fallback polling interval in ms
  enabled?: boolean;
}

export const useResearchProgress = ({
  apiBaseUrl,
  sessionId,
  pollingInterval = 2000,
  enabled = true
}: UseResearchProgressProps) => {
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);
  
  const startPolling = useCallback(() => {
    if (!sessionId || !enabled) return;
    
    clearPolling();
    
    const fetchData = async () => {
      try {
        const data = await getResearchProgressAPI(apiBaseUrl, sessionId);
        setProgress(data);
        setError(null);
        
        // If research is complete, stop polling
        if (data.complete) {
          clearPolling();
        }
      } catch (err) {
        setError(`Error fetching progress: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    pollingIntervalRef.current = setInterval(fetchData, pollingInterval);
    
    return () => clearPolling();
  }, [apiBaseUrl, sessionId, pollingInterval, clearPolling, enabled]);
  
  const connectWebSocket = useCallback(() => {
    if (!sessionId || !enabled) return;
    
    try {
      wsRef.current = createResearchProgressWebSocket(
        apiBaseUrl,
        sessionId,
        (data) => {
          setProgress(data);
          setError(null);
          
          // If research is complete, close the WebSocket
          if (data.complete) {
            wsRef.current?.close();
            setIsWebSocketConnected(false);
          }
        },
        (err) => {
          console.error('WebSocket error:', err);
          setError('WebSocket connection error. Falling back to polling.');
          setIsWebSocketConnected(false);
          startPolling(); // Fall back to polling
        },
        () => {
          setIsWebSocketConnected(false);
          startPolling(); // Fall back to polling on close
        }
      );
      
      setIsWebSocketConnected(true);
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError(`WebSocket connection failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsWebSocketConnected(false);
      startPolling(); // Fall back to polling
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [apiBaseUrl, sessionId, startPolling, enabled]);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Try WebSocket first
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearPolling();
    };
  }, [connectWebSocket, clearPolling, sessionId, enabled]);
  
  // Expose methods to manually reconnect
  const reconnect = useCallback(() => {
    // Close existing connections
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    clearPolling();
    
    // Try to connect again
    connectWebSocket();
  }, [connectWebSocket, clearPolling]);
  
  // Manually fetch latest data
  const refetch = useCallback(async () => {
    if (!sessionId || !enabled) return;
    
    try {
      setIsLoading(true);
      const data = await getResearchProgressAPI(apiBaseUrl, sessionId);
      setProgress(data);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(`Error fetching progress: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  }, [apiBaseUrl, sessionId, enabled]);
  
  return {
    progress,
    error,
    isLoading,
    isWebSocketConnected,
    reconnect,
    refetch
  };
};

export default useResearchProgress; 