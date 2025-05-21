export const APIRoutes = {
  GetPlaygroundAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents`,
  AgentRun: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents/{agent_id}/runs`,
  PlaygroundStatus: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/v1/playground/status`,
  GetPlaygroundSessions: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions`,
  GetPlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions/${sessionId}`,

  DeletePlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/v1/playground/agents/${agentId}/sessions/${sessionId}`,

  // Deep Research endpoints
  DeepResearch: (apiUrl: string) => 
    `${apiUrl}/v1/research/deep-research`,
  ResearchProgress: (apiUrl: string, sessionId: string) =>
    `${apiUrl}/v1/research/progress/${sessionId}`,
  ResearchProgressWebSocket: (apiUrl: string, sessionId: string) =>
    `${apiUrl}/v1/research/ws/research-progress/${sessionId}`,
  ActiveResearchSessions: (apiUrl: string) =>
    `${apiUrl}/v1/research/active-sessions`
}
