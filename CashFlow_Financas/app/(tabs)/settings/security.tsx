import React, { useState, useEffect } from 'react';
import { ScrollView, Switch } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Box, Text, scale, verticalScale } from '@/theme/unistyles';

export default function SecurityScreen() {
    const { t } = useTranslation();
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isHardwareSupported, setIsHardwareSupported] = useState(false);

    useEffect(() => {
        checkBiometricSupport();
        loadBiometricState();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsHardwareSupported(compatible);
    };

    const loadBiometricState = async () => {
        const savedValue = await SecureStore.getItemAsync('isBiometricEnabled');
        if (savedValue === 'true') {
            setIsBiometricEnabled(true);
        }
    };

    const toggleBiometric = async (value: boolean) => {
        if (value) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t("security.authPrompt"),
                fallbackLabel: t("security.fallbackLabel"),
            });

            if (result.success) {
                setIsBiometricEnabled(true);
                await SecureStore.setItemAsync('isBiometricEnabled', 'true');
            }
        } else {
            setIsBiometricEnabled(false);
            await SecureStore.setItemAsync('isBiometricEnabled', 'false');
        }
    };

    return (
        <Box flex={1} backgroundColor="background">
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{
                    padding: scale(24),
                    paddingBottom: verticalScale(70),
                }}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 220 }}
                >
                    <Box paddingTop="xxl" />

                    {isHardwareSupported ? (
                        <Box 
                            flexDirection="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            backgroundColor="surface"
                            padding="m"
                            borderRadius="l"
                            borderWidth={1}
                            borderColor="border"
                        >
                            <Box flex={1} marginRight="m">
                                <Text variant="body" fontWeight="600">{t("security.biometricEnable")}</Text>
                                <Text variant="caption" color="textSecondary">{t("security.biometricSubtitle")}</Text>
                            </Box>
                            <Switch 
                                value={isBiometricEnabled}
                                onValueChange={toggleBiometric}
                            />
                        </Box>
                    ) : (
                        <Text color="textSecondary">{t("security.notSupported")}</Text>
                    )}
                </MotiView>
            </ScrollView>
        </Box>
    );
}