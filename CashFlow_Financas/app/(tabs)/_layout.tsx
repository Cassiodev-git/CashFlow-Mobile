import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { BottomBar } from '@/components/BottomBar/BottomBar';

type TabRoute = 'Home' | 'Graph' | 'Relatório' | 'Perfil';

export default function TabsLayout() {
    const router = useRouter();
    const segments = useSegments();
    const currentScreen = segments[segments.length - 1];

    const getCurrentRoute = (): TabRoute => {
        switch (currentScreen) {
        case 'graph':
            return 'Graph';
        case 'report':
            return 'Relatório';
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
            router.replace('/(tabs)/profile');
            break;
        }
    };

    return (
        <Tabs
        tabBar={() => (
            <BottomBar
            currentRoute={getCurrentRoute()}
            onNavigate={handleNavigate}
            onTransactionCreated={async () => {}}
            />
        )}
        screenOptions={{
            headerShown: false,
        }}
        >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="graph" />
        <Tabs.Screen name="report" />
        <Tabs.Screen name="profile" />
        </Tabs>
    );
}
