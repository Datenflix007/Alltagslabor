// Safe-area update: wrapping the exported app in SafeAreaProvider enables reliable insets on Android/iOS.
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './frontend/app/index';

export default function RootApp() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

