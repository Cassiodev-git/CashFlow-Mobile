import { Stack, useRouter } from 'expo-router';
// Hooks
import { useState, useEffect } from 'react';
import { useUser } from '@/features/user/hooks/useUser';
import { initializeDatabase } from '@/db/database';
// Area segura
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Splash Nativa
import * as SplashScreen from 'expo-splash-screen';

// Banco de dados
import "react-native-get-random-values";
// Linguagem
import "@/i18n";
//Utils
import { logger } from '@/utils/logger';

// Garante que a Splash Screen nativa fique travada no início do APK
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbStart, setDbStart] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const { findFirstUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function setup() {
      try {
        // Inicializa o SQLite
        await initializeDatabase();
        
        // Busca se existe usuário cadastrado
        const registeredUser = await findFirstUser();
        if (registeredUser) {
          setHasUser(true);
        }
        //await new Promise(resolve => setTimeout(resolve, 4000));
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
        // Redireciona para a home
        router.replace("/(tabs)/home"); 
      }
    }
  }, [dbStart, hasUser, router]);

  if (!dbStart) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="(tabs)" /> 
      </Stack>
    </SafeAreaProvider>
  );
}