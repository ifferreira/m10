//import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import DuvidoGame from './DuvidoGame';

import './global.css';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <DuvidoGame />
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
