import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

export const fetchAdminDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const data = await adminService.getAdminDashboard();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchStudents = createAsyncThunk('admin/fetchStudents', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getStudents(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateStudentStatus = createAsyncThunk(
  'admin/updateStudentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const data = await adminService.updateStudentStatus(id, status);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchLostItemsAdmin = createAsyncThunk('admin/fetchLostItems', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getLostItemsAdmin(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchFoundItemsAdmin = createAsyncThunk('admin/fetchFoundItems', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getFoundItemsAdmin(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchResponsesAdmin = createAsyncThunk('admin/fetchResponses', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getResponsesAdmin(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMatches = createAsyncThunk('admin/fetchMatches', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getMatches(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchHandovers = createAsyncThunk('admin/fetchHandovers', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getHandovers(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAuditLogs = createAsyncThunk('admin/fetchAuditLogs', async (params, { rejectWithValue }) => {
  try {
    const data = await adminService.getAuditLogs(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAnalytics = createAsyncThunk('admin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const data = await adminService.getAnalytics();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  dashboard: null,
  students: [],
  lostItems: [],
  foundItems: [],
  responses: [],
  matches: [],
  handovers: [],
  auditLogs: [],
  analytics: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Students
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        const index = state.students.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      // Lost Items Admin
      .addCase(fetchLostItemsAdmin.fulfilled, (state, action) => {
        state.lostItems = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      // Found Items Admin
      .addCase(fetchFoundItemsAdmin.fulfilled, (state, action) => {
        state.foundItems = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      // Responses Admin
      .addCase(fetchResponsesAdmin.fulfilled, (state, action) => {
        state.responses = action.payload.responses;
        state.pagination = action.payload.pagination;
      })
      // Matches
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload.matches;
        state.pagination = action.payload.pagination;
      })
      // Handovers
      .addCase(fetchHandovers.fulfilled, (state, action) => {
        state.handovers = action.payload.handovers;
        state.pagination = action.payload.pagination;
      })
      // Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.logs;
        state.pagination = action.payload.pagination;
      })
      // Analytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export default adminSlice.reducer;

