import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useUser } from '@/features/user/hooks/useUser';
import { initializeDatabase } from '@/db/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@shopify/restyle';
import { StatusBar } from 'expo-status-bar';

import "react-native-get-random-values";
import "@/i18n";
import { logger } from '@/utils/logger';
import { lightTheme } from '@/theme/unistyles';

import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbStart, setDbStart] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const { findFirstUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();
        
        const registeredUser = await findFirstUser();
        if (registeredUser) {
          setHasUser(true);
        }
      } catch (error) {
        logger.error("Critical error starting the database:", error);
      } finally {
        setDbStart(true);
      }
    }
    setup();
  }, [findFirstUser]);

  useEffect(() => {
    if (dbStart) {
      SplashScreen.hideAsync();

      if (hasUser) {
        router.replace("/(tabs)/home"); 
      }
    }
  }, [dbStart, hasUser, router]);

  if (!dbStart) {
    return null;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <StatusBar style="dark" />
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> 
          <Stack.Screen name="(tabs)" /> 
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}