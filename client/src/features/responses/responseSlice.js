import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import responseService from '../../services/responseService';

export const fetchMyResponses = createAsyncThunk('responses/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const data = await responseService.getMyResponses();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchResponsesForLostItem = createAsyncThunk(
  'responses/fetchForLostItem',
  async (lostItemId, { rejectWithValue }) => {
    try {
      const data = await responseService.getResponsesForLostItem(lostItemId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createResponse = createAsyncThunk('responses/create', async (formData, { rejectWithValue }) => {
  try {
    const data = await responseService.createResponse(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  myResponses: [],
  itemResponses: [],
  isLoading: false,
  error: null,
};

const responseSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch My Responses
      .addCase(fetchMyResponses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyResponses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myResponses = action.payload;
      })
      .addCase(fetchMyResponses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Item Responses
      .addCase(fetchResponsesForLostItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResponsesForLostItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.itemResponses = action.payload;
      })
      .addCase(fetchResponsesForLostItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Response
      .addCase(createResponse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createResponse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myResponses.unshift(action.payload);
      })
      .addCase(createResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default responseSlice.reducer;

