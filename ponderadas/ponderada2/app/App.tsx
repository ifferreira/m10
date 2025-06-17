//import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import DuvidoGame from './DuvidoGame';
import AuthScreen from './components/AuthScreen';
import { ENV } from './env';

import './global.css';

const API_BASE_URL = ENV.ACHIEVEMENT_API_BASE_URL;

export default function App() {
  const [auth, setAuth] = useState<{ token: string; email: string } | null>(null);

  if (!auth) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthScreen apiBaseUrl={API_BASE_URL} onAuth={(token, email) => setAuth({ token, email })} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DuvidoGame token={auth.token} email={auth.email} apiBaseUrl={API_BASE_URL} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10451d',
    justifyContent: 'center',
  },
});
