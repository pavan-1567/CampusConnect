import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import foundItemService from '../../services/foundItemService';

export const fetchFoundItems = createAsyncThunk('foundItems/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const data = await foundItemService.getFoundItems(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyFoundItems = createAsyncThunk('foundItems/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const data = await foundItemService.getMyFoundItems();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchFoundItemById = createAsyncThunk('foundItems/fetchById', async (id, { rejectWithValue }) => {
  try {
    const data = await foundItemService.getFoundItemById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createFoundItem = createAsyncThunk('foundItems/create', async (formData, { rejectWithValue }) => {
  try {
    const data = await foundItemService.createFoundItem(formData);
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

const foundItemSlice = createSlice({
  name: 'foundItems',
  initialState,
  reducers: {
    clearCurrentFoundItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchFoundItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoundItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFoundItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My
      .addCase(fetchMyFoundItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyFoundItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myItems = action.payload;
      })
      .addCase(fetchMyFoundItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchFoundItemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoundItemById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchFoundItemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createFoundItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFoundItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myItems.unshift(action.payload);
      })
      .addCase(createFoundItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentFoundItem } = foundItemSlice.actions;
export default foundItemSlice.reducer;

