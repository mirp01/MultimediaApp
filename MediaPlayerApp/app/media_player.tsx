import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import MediaPlayer from '@/components/MediaPlayer';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MediaPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});


