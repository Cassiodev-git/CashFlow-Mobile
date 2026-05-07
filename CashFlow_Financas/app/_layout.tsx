import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '@/db/database';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase()
  })
  return <Stack/>
}
