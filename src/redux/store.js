import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default to localStorage
import listSlice from './taskSlices'; // Your listSlice reducer

// Redux Persist configuration
const persistConfig = {
  key: 'root', // The key used to persist the state
  storage, // This uses localStorage by default
  whitelist: ['user'], // Only persist the 'user' slice of the state
};

// Wrap your reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, listSlice);

// Create the store with the persisted reducer
const store = configureStore({
  reducer: {
    lists: persistedReducer, // Use the persisted reducer
  },
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
