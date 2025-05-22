'use client'

import React, { useEffect, useState } from 'react'
import { usePlaygroundStore } from '@/store'
import Icon from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

interface ResearchProgressProps {
  sessionId: string
}

interface ProgressData {
  progress: number
  current_stage: string
  active_tasks: number
  completed_tasks: number
  elapsed_time_seconds: number
  status: string
  current_task?: string | null
}

const stageLabels = {
  'planning': 'Research Planning',
  'data_collection': 'Data Collection',
  'analysis': 'Analysis',
  'synthesis': 'Synthesis',
  'report_generation': 'Report Generation',
  'complete': 'Complete'
}

const ResearchProgress: React.FC<ResearchProgressProps> = ({ sessionId }) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { selectedEndpoint } = usePlaygroundStore()

  useEffect(() => {
    if (!sessionId) return

    const fetchProgress = async () => {
      try {
        const response = await fetch(`${selectedEndpoint}/v1/agents/research/progress/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          setProgressData(data)
          
          // If research is still active, poll for updates
          if (data.status === 'active') {
            setTimeout(fetchProgress, 3000) // Poll every 3 seconds
          }
        } else {
          const errorData = await response.json()
          setError(errorData.detail || 'Failed to fetch progress')
        }
      } catch (err) {
        setError('Network error while fetching progress')
        console.error('Error fetching research progress:', err)
      }
    }

    fetchProgress()
  }, [sessionId, selectedEndpoint])

  if (error) {
    return null // Don't show anything if there's an error
  }

  if (!progressData) {
    return null // Don't show anything while loading
  }

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  // Don't display if completed
  if (progressData.status === 'completed' && progressData.progress >= 1.0) {
    return null
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-background-secondary p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-spin">⟳</div>
          <h3 className="text-sm font-medium">
            Research in Progress - {stageLabels[progressData.current_stage as keyof typeof stageLabels]}
          </h3>
        </div>
        <div className="text-xs text-secondary">
          {formatElapsedTime(progressData.elapsed_time_seconds)}
        </div>
      </div>
      
      <Progress value={progressData.progress * 100} className="mb-3 h-1" />
      
      <div className="grid grid-cols-2 gap-2 text-xs text-secondary">
        <div>
          <span className="font-medium">Current stage:</span> {stageLabels[progressData.current_stage as keyof typeof stageLabels]}
        </div>
        <div>
          <span className="font-medium">Tasks:</span> {progressData.completed_tasks} completed, {progressData.active_tasks} active
        </div>
      </div>
      
      {progressData.current_task && (
        <div className="mt-2 text-xs text-accent">
          <span className="font-medium">Working on:</span> {progressData.current_task}
        </div>
      )}
    </div>
  )
}

export default ResearchProgress 