import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { usePlaygroundStore } from '@/store';

// Define interface for the API response task format
interface ApiTask {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
}

interface ResearchProgressProps {
  sessionId: string;
  progress?: number;
  stage?: string;
  tasks?: Array<{
    id: string;
    name: string;
    status: 'complete' | 'in-progress' | 'pending';
  }>;
}

// Map API research stages to user-friendly names
const stageLabels: Record<string, string> = {
  'PLANNING': 'Planning Research',
  'DATA_COLLECTION': 'Collecting Data',
  'ANALYSIS': 'Analyzing Information',
  'SYNTHESIS': 'Synthesizing Findings',
  'REPORT_GENERATION': 'Generating Report',
  'COMPLETE': 'Research Complete',
  'ERROR': 'Error Occurred'
};

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  sessionId,
  progress: initialProgress,
  stage: initialStage,
  tasks: initialTasks = []
}) => {
  const [progress, setProgress] = useState(initialProgress || 0);
  const [stage, setStage] = useState(initialStage || 'PLANNING');
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedEndpoint } = usePlaygroundStore();

  useEffect(() => {
    if (!sessionId) return;
    
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${selectedEndpoint}/v1/agents/research/progress/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch research progress');
        }
        
        const data = await response.json();
        
        // Calculate progress based on stage
        let calculatedProgress = 0;
        switch (data.stage) {
          case 'PLANNING': calculatedProgress = 10; break;
          case 'DATA_COLLECTION': calculatedProgress = 30; break;
          case 'ANALYSIS': calculatedProgress = 60; break;
          case 'SYNTHESIS': calculatedProgress = 80; break;
          case 'REPORT_GENERATION': calculatedProgress = 90; break;
          case 'COMPLETE': calculatedProgress = 100; break;
          default: calculatedProgress = 0;
        }
        
        setProgress(data.progress || calculatedProgress);
        setStage(data.stage || 'PLANNING');
        
        // Transform tasks from API format if available
        if (data.tasks) {
          const formattedTasks = data.tasks.map((task: ApiTask) => ({
            id: task.id || String(Math.random()),
            name: task.name || task.description || 'Research Task',
            status: task.status || 'pending'
          }));
          setTasks(formattedTasks);
        }
      } catch (err) {
        console.error('Error fetching research progress:', err);
        setError('Unable to load research progress');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch immediately
    fetchProgress();
    
    // Then fetch every 5 seconds
    const interval = setInterval(fetchProgress, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId, selectedEndpoint]);

  if (loading && !initialProgress) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
        <p className="text-sm text-center">Loading research progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
        <p className="text-sm text-center text-red-500">{error}</p>
      </div>
    );
  }

  const displayStage = stageLabels[stage] || stage;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium">Research Progress: {displayStage}</h3>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {tasks.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Tasks</h4>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  task.status === 'complete' ? 'bg-green-500' : 
                  task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">{task.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResearchProgress; 