import { combineReducers } from '@reduxjs/toolkit';
import { analyticsApi } from '../main/analytics/analyticsApi';
import { adminApi } from '../main/admin/adminApi';
import fuse from './fuse';
import i18n from './i18nSlice';
import user from './userSlice';

const createReducer = (asyncReducers) => (state, action) => {
  const combinedReducer = combineReducers({
    fuse,
    i18n,
    user,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    ...asyncReducers,
  });

  /*
	Reset the redux store when user logged out
	 */
  if (action.type === 'user/userLoggedOut') {
    // state = undefined;
  }

  return combinedReducer(state, action);
};

export default createReducer;
