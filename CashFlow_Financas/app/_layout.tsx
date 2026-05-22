import { Stack, useRouter } from 'expo-router';
//hooks
import { useState, useEffect } from 'react';
import { useUser } from '@/features/user/hooks/useUser';
import { View, ActivityIndicator } from 'react-native';
import { initializeDatabase } from '@/db/database';
//Banco de dados
import "react-native-get-random-values";
//Linguagem
import "@/i18n";
import { colors } from '@/theme';

export default function RootLayout() {
  const [dbStart, setDbStart] = useState(false);
  const [user, setUser] = useState(false);
  const { findFirstUser } = useUser();
  const router = useRouter();



  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();
        const registeredUser = await findFirstUser();
        if (registeredUser) {
          setUser(true);
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
    if (dbStart && user) {
      router.replace("/(tabs)/home"); 
    }
  }, [dbStart, user, router]);

  if (!dbStart) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color={colors.surface} />
      </View>
    );
  }


  return (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" /> 
    <Stack.Screen name="(tabs)" /> 
  </Stack>
);
}
