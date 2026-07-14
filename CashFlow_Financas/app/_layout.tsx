import { Stack, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useUser } from '@/features/user/hooks/useUser';
import { initializeDatabase } from '@/db/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@shopify/restyle';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import "react-native-get-random-values";
import "@/i18n";
import { logger } from '@/utils/logger';
import { Box, Text, scale, Theme } from '@/theme/unistyles';
import { LoadingScreen } from '@/components/LoadingScreen/LoadingScreen';
import notificationService from '@/features/notification/services/notificationService';
import { AppThemeProvider, useAppTheme } from '@/features/settings/context/ThemeContext';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const [dbStart, setDbStart] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAuthUnlocked, setIsAuthUnlocked] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { findFirstUser } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  
  const { isDark } = useAppTheme();
  const theme = useTheme<Theme>();

  const registerOpenedNotification = useCallback(async (response: Notifications.NotificationResponse | null) => {
    const dbId = response?.notification.request.content.data?.db_id;
    if (typeof dbId !== 'string') return;

    try {
      await notificationService.markAsOpened(dbId);
    } catch (error) {
      logger.error("Error registering opened notification:", error);
    }
  }, []);

  const requestBiometricUnlock = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("security.unlockPrompt"),
        fallbackLabel: t("security.fallbackLabel"),
        cancelLabel: t("common.cancel"),
        disableDeviceFallback: false,
      });

      setIsAuthUnlocked(result.success);
      return result.success;
    } catch (error) {
      logger.error("Error authenticating with biometrics:", error);
      setIsAuthUnlocked(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [t]);

  useEffect(() => {
    async function setup() {
      try {
        await initializeDatabase();
        
        const registeredUser = await findFirstUser();
        if (registeredUser) {
          setHasUser(true);
        }

        const biometricEnabled = await SecureStore.getItemAsync('isBiometricEnabled');
        const shouldLockApp = Boolean(registeredUser) && biometricEnabled === 'true';
        setIsBiometricEnabled(shouldLockApp);

        if (shouldLockApp) {
          setIsAuthUnlocked(false);
          await requestBiometricUnlock();
        } else {
          setIsAuthUnlocked(true);
        }
      } catch (error) {
        logger.error("Critical error starting the app:", error);
      } finally {
        setDbStart(true);
      }
    }
    setup();
  }, [findFirstUser, requestBiometricUnlock]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(registerOpenedNotification);

    Notifications.getLastNotificationResponseAsync()
      .then(registerOpenedNotification)
      .catch((error) => logger.error("Error reading last notification response:", error));

    return () => {
      subscription.remove();
    };
  }, [registerOpenedNotification]);

  useEffect(() => {
    if (dbStart) {
      SplashScreen.hideAsync();

      if (hasUser && isAuthUnlocked) {
        router.replace("/(tabs)/home"); 
      }
    }
  }, [dbStart, hasUser, isAuthUnlocked, router]);

  if (!dbStart) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <SafeAreaProvider>
        {isBiometricEnabled && !isAuthUnlocked ? (
          <Box flex={1} backgroundColor="background" justifyContent="center" alignItems="center" paddingHorizontal="l">
            <Box
              width={scale(72)}
              height={scale(72)}
              borderRadius="xl"
              backgroundColor="primaryLight"
              justifyContent="center"
              alignItems="center"
              marginBottom="l"
            >
              <Feather name="lock" size={scale(32)} color={theme.colors.primaryDark} />
            </Box>
            <Text variant="titleMedium" color="textPrimary" fontWeight="700" style={{ textAlign: 'center' }}>
              {t("security.lockedTitle")}
            </Text>
            <Text variant="body" color="textSecondary" marginTop="s" marginBottom="l" style={{ textAlign: 'center' }}>
              {t("security.lockedSubtitle")}
            </Text>
            <TouchableOpacity onPress={requestBiometricUnlock} disabled={isAuthenticating} activeOpacity={0.85}>
              <Box backgroundColor="primary" borderRadius="s" paddingHorizontal="l" paddingVertical="m" style={{ opacity: isAuthenticating ? 0.7 : 1 }}>
                <Text color="textInverse" fontWeight="600">
                  {isAuthenticating ? t("security.authenticating") : t("security.unlockAction")}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" /> 
            <Stack.Screen name="(tabs)" /> 
          </Stack>
        )}
      </SafeAreaProvider>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}