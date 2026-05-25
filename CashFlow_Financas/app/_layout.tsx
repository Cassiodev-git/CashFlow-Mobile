import { Stack, useRouter } from 'expo-router';
// Hooks
import { useState, useEffect } from 'react';
import { useUser } from '@/features/user/hooks/useUser';
import { initializeDatabase } from '@/db/database';
// Area segura
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Splash Nativa
import * as SplashScreen from 'expo-splash-screen';
// Componente de Loading Customizado
import { LoadingScreen } from '@/components/LoadingScreen/LoadingScreen';

// Banco de dados
import "react-native-get-random-values";
// Linguagem
import "@/i18n";

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
      } catch (error) {
        console.error("Erro crítico ao iniciar o banco de dados:", error);
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
    <SafeAreaProvider>
      <LoadingScreen />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="(tabs)" /> 
      </Stack>
    </SafeAreaProvider>
  );
}