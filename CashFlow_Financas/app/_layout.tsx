import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '@/db/database';
import "react-native-get-random-values";

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase()
  }, [])
  return <Stack/>
}
