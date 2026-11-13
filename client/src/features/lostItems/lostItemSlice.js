import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import lostItemService from '../../services/lostItemService';

export const fetchLostItems = createAsyncThunk('lostItems/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const data = await lostItemService.getLostItems(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyLostItems = createAsyncThunk('lostItems/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const data = await lostItemService.getMyLostItems();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchLostItemById = createAsyncThunk('lostItems/fetchById', async (id, { rejectWithValue }) => {
  try {
    const data = await lostItemService.getLostItemById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createLostItem = createAsyncThunk('lostItems/create', async (formData, { rejectWithValue }) => {
  try {
    const data = await lostItemService.createLostItem(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const cancelLostItem = createAsyncThunk('lostItems/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const data = await lostItemService.cancelLostItem(id, reason);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  items: [],
  myItems: [],
  currentItem: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const lostItemSlice = createSlice({
  name: 'lostItems',
  initialState,
  reducers: {
    clearCurrentLostItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchLostItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLostItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLostItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My
      .addCase(fetchMyLostItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLostItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myItems = action.payload;
      })
      .addCase(fetchMyLostItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchLostItemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLostItemById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchLostItemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createLostItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLostItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myItems.unshift(action.payload);
      })
      .addCase(createLostItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel
      .addCase(cancelLostItem.fulfilled, (state, action) => {
        const index = state.myItems.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.myItems[index] = action.payload;
        }
        if (state.currentItem && state.currentItem._id === action.payload._id) {
          state.currentItem = action.payload;
        }
      });
  },
});

export const { clearCurrentLostItem } = lostItemSlice.actions;
export default lostItemSlice.reducer;

