import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from '@/utils/responsive';

import { ButtonBar } from '@/features/transaction/components/ButtonBar/ButtonBar';

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
        const activeColor = colors.income || '#2E7D32'; 
        const inactiveColor = colors.textSecondary || '#94A3B8';

        return (
            <TouchableOpacity
                key={tab.route}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => onNavigate?.(tab.route)}
            >
                <MotiView
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'timing', duration: 150 }}
                    style={styles.iconContainer}
                >
                    <Feather 
                        name={tab.icon} 
                        size={22} 
                        color={isActive ? activeColor : inactiveColor} 
                    />
                </MotiView>
                <Text style={[styles.tabLabel, { color: isActive ? activeColor : inactiveColor }]}>
                    {tab.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const dynamicPaddingBottom = insets.bottom > 0 ? insets.bottom : 14;

    return (
        <View 
            style={[
                styles.container, 
                { paddingBottom: dynamicPaddingBottom }
            ]}
        >
            <View style={styles.tabSection}>
                {tabs.slice(0, 2).map((tab) => renderTab(tab))}
            </View>
            
            <View style={styles.centerButtonContainer}>
                <ButtonBar onTransactionCreated={onTransactionCreated} />
            </View>
            
            <View style={styles.tabSection}>
                {tabs.slice(2, 4).map((tab) => renderTab(tab))}
            </View>
        </View>
    );
}


const styles = ScaledSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14, 
        paddingTop: 4,        
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        
    },
    tabSection: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4, 
    },
    tabLabel: {
        fontSize: 11, 
        fontWeight: '500',
    },
    centerButtonContainer: {
        width: 60, 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 50,
    }
});