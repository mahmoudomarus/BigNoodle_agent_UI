import React from 'react';
import { Progress } from '@/components/ui/progress';

// Remove unused Icon import that was causing the build error

interface ResearchProgressProps {
  progress: number;
  stage: string;
  tasks?: Array<{
    id: string;
    name: string;
    status: 'complete' | 'in-progress' | 'pending';
  }>;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  progress,
  stage,
  tasks = []
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium">Research Progress: {stage}</h3>
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