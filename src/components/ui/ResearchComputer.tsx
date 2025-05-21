import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Cpu, FileText, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Progress } from "./Progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ProgressData {
  id: string;
  topic: string;
  status: string;
  completion_percentage: number;
  current_stage: string;
  searches_performed: {
    timestamp: number;
    query: string;
    tool: string;
    result_count: number;
  }[];
  tasks_created: {
    timestamp: number;
    task_id: string;
    description: string;
  }[];
  tasks_completed: {
    timestamp: number;
    task_id: string;
  }[];
  sections_completed: {
    timestamp: number;
    section_name: string;
  }[];
  last_message: string;
}

export const ResearchComputer = ({ sessionId }: { sessionId: string }) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const selectedEndpoint = useSelector((state: RootState) => state.endpoint.selectedEndpoint);

  // Fetch progress data function
  const fetchProgressData = async () => {
    try {
      const response = await axios.get(
        `${selectedEndpoint}/v1/progress/${sessionId}`
      );
      setProgressData(response.data);
      
      // If research is completed, stop polling
      if (response.data.status === "completed") {
        setIsPolling(false);
      }
    } catch (err) {
      console.error("Error fetching research progress:", err);
      setError("Failed to fetch research progress");
    }
  };

  // Set up polling
  useEffect(() => {
    if (!sessionId || !isPolling) return;

    // Initial fetch
    fetchProgressData();

    // Set up interval for polling
    const interval = setInterval(fetchProgressData, 5000); // Poll every 5 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [sessionId, isPolling, selectedEndpoint]);

  // If no progress data and no error, show loading
  if (!progressData && !error) {
    return (
      <div className="fixed bottom-8 right-8 bg-slate-800 p-4 rounded-lg shadow-lg text-white w-80 z-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-indigo-400 animate-pulse" />
            <h3 className="font-medium">Research Computer</h3>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="flex items-center justify-center py-4">
          <Clock size={36} className="text-indigo-400 animate-pulse" />
          <p className="ml-2">Initializing research process...</p>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="fixed bottom-8 right-8 bg-slate-800 p-4 rounded-lg shadow-lg text-white w-80 z-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400" />
            <h3 className="font-medium">Research Computer</h3>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // If the component is hidden, show a small indicator that can be clicked to show again
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-8 right-8 bg-slate-800 p-3 rounded-full shadow-lg text-white z-50 hover:bg-slate-700"
      >
        <Cpu size={20} className="text-indigo-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 bg-slate-800 p-4 rounded-lg shadow-lg text-white w-96 max-h-[70vh] overflow-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-indigo-400" />
          <h3 className="font-medium">Research Computer</h3>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Research Progress</span>
          <span>{progressData?.completion_percentage}%</span>
        </div>
        <Progress 
          value={progressData?.completion_percentage || 0} 
          className="h-2" 
        />
      </div>

      <div className="mb-3 bg-slate-700 p-2 rounded text-sm">
        <div className="font-medium mb-1">Current Stage:</div>
        <div className="text-indigo-300">{progressData?.current_stage}</div>
      </div>

      {/* Recent Searches */}
      <div className="mb-3">
        <div className="font-medium mb-1 text-sm">Recent Searches:</div>
        <div className="max-h-24 overflow-y-auto">
          {progressData?.searches_performed
            .slice(-3)
            .reverse()
            .map((search, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs mb-1.5 bg-slate-700 p-1.5 rounded"
              >
                <Search size={14} className="text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-indigo-200 font-medium">{search.query}</div>
                  <div className="text-slate-400 mt-0.5">
                    {search.result_count} results • {search.tool} • 
                    {formatDistanceToNow(new Date(search.timestamp * 1000), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          {progressData?.searches_performed.length === 0 && (
            <div className="text-slate-400 text-xs italic">No searches performed yet</div>
          )}
        </div>
      </div>

      {/* Research Tasks */}
      <div className="mb-3">
        <div className="font-medium mb-1 text-sm">Research Tasks:</div>
        <div className="max-h-24 overflow-y-auto">
          {progressData?.tasks_created.map((task, index) => {
            const isCompleted = progressData.tasks_completed.some(
              (t) => t.task_id === task.task_id
            );
            return (
              <div
                key={index}
                className="flex items-start gap-2 text-xs mb-1.5 bg-slate-700 p-1.5 rounded"
              >
                {isCompleted ? (
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                ) : (
                  <Clock size={14} className="text-yellow-400 mt-0.5" />
                )}
                <div>
                  <div
                    className={`${
                      isCompleted ? "text-green-200" : "text-yellow-200"
                    } font-medium`}
                  >
                    {task.description}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {task.task_id} • 
                    {formatDistanceToNow(new Date(task.timestamp * 1000), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
          {progressData?.tasks_created.length === 0 && (
            <div className="text-slate-400 text-xs italic">No tasks created yet</div>
          )}
        </div>
      </div>

      {/* Completed Sections */}
      <div className="mb-3">
        <div className="font-medium mb-1 text-sm">Completed Sections:</div>
        <div className="max-h-24 overflow-y-auto">
          {progressData?.sections_completed.map((section, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-xs mb-1.5 bg-slate-700 p-1.5 rounded"
            >
              <FileText size={14} className="text-green-400 mt-0.5" />
              <div>
                <div className="text-green-200 font-medium">{section.section_name}</div>
                <div className="text-slate-400 mt-0.5">
                  {formatDistanceToNow(new Date(section.timestamp * 1000), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          {progressData?.sections_completed.length === 0 && (
            <div className="text-slate-400 text-xs italic">No sections completed yet</div>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-2">
        Last updated: {formatDistanceToNow(new Date(progressData?.latest_update ? progressData.latest_update * 1000 : Date.now()), { addSuffix: true })}
      </div>
    </div>
  );
}; 