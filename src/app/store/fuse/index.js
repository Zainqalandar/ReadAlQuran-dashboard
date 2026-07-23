import { combineReducers } from '@reduxjs/toolkit';
import settings from './settingsSlice';
import message from './messageSlice';
import navbar from './navbarSlice';
import navigation from './navigationSlice';
import dialog from './dialogSlice';

const fuseReducers = combineReducers({
  settings,
  message,
  navbar,
  navigation,
  dialog
});

export default fuseReducers;
