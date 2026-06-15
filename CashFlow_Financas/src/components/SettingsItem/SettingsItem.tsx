import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Box, Text, Theme } from '@/theme/unistyles';
import { useTheme } from '@shopify/restyle';

interface SettingsItemProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void; 
}

export const SettingsItem = ({ icon, title, subtitle, onPress }: SettingsItemProps) => {
    const theme = useTheme<Theme>();
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: theme.colors.divider }}
        >
            <Box flexDirection="row" alignItems="center">
                <Feather name={icon as any} size={20} color={theme.colors.textPrimary} />
                <Box marginLeft="m" flex={1}>
                    <Text variant="body" fontWeight="500">{title}</Text>
                    <Text variant="caption" color="textSecondary">{subtitle}</Text>
                </Box>
                <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </Box>
        </TouchableOpacity>
    );
};