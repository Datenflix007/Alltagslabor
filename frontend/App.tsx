// Safe-area update: Expo entry now provides SafeAreaProvider context for all screens.
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './app/index';

export default function ExpoApp() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}
