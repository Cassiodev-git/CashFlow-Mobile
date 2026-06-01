import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';

import { User } from "@/features/user/types/User";
import { Skeleton } from '../Skeleton/Skeleton';
import { Box, Text, type Theme } from '@/theme/unistyles';

interface TopBarProps {
    user: User | null;
    onNotificationPress?: () => void;
}

export function TopBar({
    user,
    onNotificationPress
}: TopBarProps) {

    const { t } = useTranslation();
    const theme = useTheme<Theme>();

    const fullText = `${t("greetings.hello")}, ${user?.name ?? ""} 👋`;

    const [displayedText, setDisplayedText] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const translateY = useRef(new Animated.Value(4)).current;

    useEffect(() => {
        setDisplayedText(fullText);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),

            Animated.timing(translateY, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            })
        ]).start();

    }, [fadeAnim, fullText, translateY]);

    return (
        <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingTop="xs"
            paddingBottom="m"
        >
            <Box flex={1}>
                <Animated.Text
                    style={[
                        {
                            fontSize: 22,
                            fontWeight: '700',
                            color: theme.colors.textPrimary,
                            marginBottom: 4,
                            opacity: fadeAnim,
                            transform: [
                                { translateY }
                            ]
                        }
                    ]}
                >
                    {displayedText}
                </Animated.Text>

                <Text variant="body" color="textSecondary">
                    {t("greetings.financeSummary")}
                </Text>
            </Box>
        </Box>
    );
}

export function TopBarSkeleton() {
    return (
        <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingTop="xs"
            paddingBottom="m"
        >
            <Box flex={1}>
                <Box height={26} marginBottom="xs" justifyContent="center">
                    <Skeleton width={180} height={22} borderRadius={4} />
                </Box>
                <Box height={18} justifyContent="center">
                    <Skeleton width={120} height={14} borderRadius={4} />
                </Box>
            </Box>
        </Box>
    );
}
