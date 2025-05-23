import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/ui/textarea';
import { usePlaygroundStore } from '@/store';

// Define interface for the API response task format
interface ApiTask {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
}

interface ApprovalRequest {
  stage: string;
  proposal: string;
  next_stage: string;
  status: string;
  created_at: number;
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
  onApprovalResponse?: (approved: boolean, feedback?: string) => void;
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
  tasks: initialTasks = [],
  onApprovalResponse
}) => {
  const [progress, setProgress] = useState(initialProgress || 0);
  const [stage, setStage] = useState(initialStage || 'PLANNING');
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<Record<string, ApprovalRequest>>({});
  const [feedback, setFeedback] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const { selectedEndpoint } = usePlaygroundStore();

  // Check for pending approvals
  const checkPendingApprovals = async () => {
    try {
      const response = await fetch(`${selectedEndpoint}/v1/agents/research/pending-approvals/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.pending_approvals || {});
      }
    } catch (err) {
      console.error('Error checking pending approvals:', err);
    }
  };

  // Submit approval decision
  const submitApproval = async (stage: string, approved: boolean) => {
    setSubmittingApproval(true);
    try {
      const response = await fetch(`${selectedEndpoint}/v1/agents/research/approve/${sessionId}/${stage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          feedback: feedback.trim() || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Clear pending approvals for this stage
        setPendingApprovals(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].stage === stage) {
              delete updated[key];
            }
          });
          return updated;
        });
        
        // Clear feedback
        setFeedback('');
        
        // Notify parent component if callback provided
        if (onApprovalResponse) {
          onApprovalResponse(approved, feedback.trim() || undefined);
        }
        
        console.log('Approval submitted:', result);
        
      } else {
        throw new Error('Failed to submit approval');
      }
    } catch (err) {
      console.error('Error submitting approval:', err);
      setError('Failed to submit approval decision');
    } finally {
      setSubmittingApproval(false);
    }
  };

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
    checkPendingApprovals();
    
    // Then fetch every 5 seconds
    const interval = setInterval(() => {
      fetchProgress();
      checkPendingApprovals();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId, selectedEndpoint]);

  if (loading && !initialProgress) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
        <p className="text-sm text-center">Loading research progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
        <p className="text-sm text-center text-red-500">{error}</p>
      </div>
    );
  }

  const displayStage = stageLabels[stage] || stage;
  const hasPendingApprovals = Object.keys(pendingApprovals).length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 mt-4">
      {/* Main Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Research Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{displayStage}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
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
      </div>

      {/* Approval Requests */}
      {hasPendingApprovals && (
        <div className="space-y-3">
          {Object.entries(pendingApprovals).map(([approvalId, approval]) => (
            <div key={approvalId} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  🔍 Approval Required: {approval.stage.charAt(0).toUpperCase() + approval.stage.slice(1)}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please review the {approval.stage} and approve to continue
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Proposal:</h4>
                  <div className="text-sm whitespace-pre-wrap">{approval.proposal}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feedback (optional):
                  </label>
                  <TextArea
                    value={feedback}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                    placeholder="Add any feedback or modifications you'd like..."
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => submitApproval(approval.stage, true)}
                    disabled={submittingApproval}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    {submittingApproval ? 'Submitting...' : '✅ Approve & Continue'}
                  </Button>
                  <Button
                    onClick={() => submitApproval(approval.stage, false)}
                    disabled={submittingApproval}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    {submittingApproval ? 'Submitting...' : '❌ Reject'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchProgress; 