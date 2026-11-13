import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import lostItemReducer from '../features/lostItems/lostItemSlice';
import foundItemReducer from '../features/foundItems/foundItemSlice';
import responseReducer from '../features/responses/responseSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lostItems: lostItemReducer,
    foundItems: foundItemReducer,
    responses: responseReducer,
    notifications: notificationReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

