import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { BottomBar } from '@/components/BottomBar/BottomBar';
import { type Theme } from '@/theme/unistyles';
type TabRoute = 'Home' | 'Graph' | 'Relatório' | 'Perfil';

export default function TabsLayout() {
    const router = useRouter();
    const segments = useSegments();
    const theme = useTheme<Theme>();
    const currentScreen = segments[segments.length - 1];
    const settingsSegmentIndex = segments.indexOf('settings');
    const settingsChildScreen = settingsSegmentIndex >= 0 ? segments[settingsSegmentIndex + 1] : undefined;
    const isSettingsDetailsScreen = Boolean(settingsChildScreen && settingsChildScreen !== 'index');

    const getCurrentRoute = (): TabRoute => {
        switch (currentScreen) {
        case 'graph':
            return 'Graph';
        case 'report':
            return 'Relatório';
        case 'settings':
        case 'index':
        case 'profile':
            return 'Perfil';
        default:
            return 'Home';
        }
    };

    const handleNavigate = (route: TabRoute) => {
        switch (route) {
        case 'Home':
            router.replace('/(tabs)/home');
            break;
        case 'Graph':
            router.replace('/(tabs)/graph');
            break;
        case 'Relatório':
            router.replace('/(tabs)/report');
            break;
        case 'Perfil':
            router.replace('/(tabs)/settings');
            break;
        }
    };

    return (
        <Tabs
        tabBar={() => isSettingsDetailsScreen ? null : (
            <BottomBar
            currentRoute={getCurrentRoute()}
            onNavigate={handleNavigate}
            onTransactionCreated={async () => {}}
            />
        )}
        screenOptions={{
            headerShown: false,
            animation: 'none', 
            sceneStyle: { backgroundColor: theme.colors.card } 
        }}
        >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="graph" />
        <Tabs.Screen name="report" />
        <Tabs.Screen name="settings" />
        </Tabs>
    );
}
