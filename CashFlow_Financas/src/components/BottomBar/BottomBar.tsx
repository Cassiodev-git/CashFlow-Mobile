import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonBar } from '@/features/transaction/components/ButtonBar/ButtonBar';
import { Box, Text, scale } from '@/theme/unistyles';

type TabRoute = 'Home' | 'Graph' | 'Relatório' | 'Perfil';

interface BottomBarProps {
    currentRoute?: TabRoute;
    onNavigate?: (route: TabRoute) => void;
    onTransactionCreated?: () => void | Promise<void>;
}

export function BottomBar({ currentRoute = 'Home', onNavigate, onTransactionCreated }: BottomBarProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const tabs: { route: TabRoute; icon: keyof typeof Feather.glyphMap; label: string }[] = [
        { route: 'Home', icon: 'home', label: t("bottomBar.home") },
        { route: 'Graph', icon: 'bar-chart-2', label: t("bottomBar.graph") },
        { route: 'Relatório', icon: 'file-text', label: t("bottomBar.report") },
        { route: 'Perfil', icon: 'user', label: t("bottomBar.profile") },
    ];

    const renderTab = (tab: typeof tabs[0]) => {
        const isActive = currentRoute === tab.route;
        const activeColor = "#289653"; 
        const inactiveColor = "#6F7583";

        return (
            <TouchableOpacity
                key={tab.route}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: scale(60),
                    height: '100%',
                }}
                activeOpacity={0.7}
                onPress={() => onNavigate?.(tab.route)}
            >
                <MotiView
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'timing', duration: 150 }}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 4, 
                    }}
                >
                    <Feather 
                        name={tab.icon} 
                        size={22} 
                        color={isActive ? activeColor : inactiveColor} 
                    />
                </MotiView>
                <Text 
                    variant="caption" 
                    fontWeight="500" 
                    style={{ fontSize: 11, color: isActive ? activeColor : inactiveColor }}
                >
                    {tab.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const dynamicPaddingBottom = insets.bottom > 0 ? insets.bottom : 14;

    return (
        <Box 
            backgroundColor="surface"
            borderTopWidth={scale(1)}
            borderColor="border"
            paddingHorizontal="s"
            paddingTop="xs"
            flexDirection="row"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingBottom: dynamicPaddingBottom
            }}
        >
            <Box flexDirection="row" flex={1} justifyContent="space-around" alignItems="center">
                {tabs.slice(0, 2).map((tab) => renderTab(tab))}
            </Box>
            
            <Box width={60} alignItems="center" justifyContent="center" height="100%" style={{ zIndex: 50 }}>
                <ButtonBar onTransactionCreated={onTransactionCreated} />
            </Box>
            
            <Box flexDirection="row" flex={1} justifyContent="space-around" alignItems="center">
                {tabs.slice(2, 4).map((tab) => renderTab(tab))}
            </Box>
        </Box>
    );
}