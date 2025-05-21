import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

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
  latest_update?: number;
}

interface ProgressState {
  data: ProgressData | null;
  loading: boolean;
  error: string | null;
  isPolling: boolean;
}

const initialState: ProgressState = {
  data: null,
  loading: false,
  error: null,
  isPolling: true
};

// Async thunk for fetching progress data
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async ({ sessionId, endpoint }: { sessionId: string, endpoint: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${endpoint}/v1/progress/${sessionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.message || 'Failed to fetch progress data');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload;
    },
    clearProgress: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action: PayloadAction<ProgressData>) => {
        state.loading = false;
        state.data = action.payload;
        
        // If research is completed, stop polling
        if (action.payload.status === 'completed') {
          state.isPolling = false;
        }
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setPolling, clearProgress } = progressSlice.actions;
export default progressSlice.reducer; 