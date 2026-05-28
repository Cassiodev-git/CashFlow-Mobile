import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Animated,
} from 'react-native';

import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';

import { User } from "@/features/user/types/User";
import { ScaledSheet } from '@/utils/responsive';
import { Skeleton } from '../Skeleton/Skeleton';

interface TopBarProps {
    user: User | null;
    onNotificationPress?: () => void;
}

export function TopBar({
    user,
    onNotificationPress
}: TopBarProps) {

    const { t } = useTranslation();

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
        <View style={styles.container}>

            <View style={styles.textContainer}>

                <Animated.Text
                    style={[
                        styles.greetingText,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY }
                            ]
                        }
                    ]}
                >
                    {displayedText}
                </Animated.Text>

                <Text style={styles.subtitleText}>
                    {t("greetings.financeSummary")}
                </Text>

            </View>

            {/*<TouchableOpacity
                activeOpacity={0.7}
                onPress={onNotificationPress}
                style={styles.iconButton}
            >

                <Feather
                    name="bell"
                    size={24}
                    color={colors.icon}
                />

                <View style={styles.notificationDot} />

            </TouchableOpacity>*/}

        </View>
    );
}

export function TopBarSkeleton() {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <View style={{ height: 26, marginBottom: 4, justifyContent: 'center' }}>
                    <Skeleton width={180} height={22} borderRadius={4} />
                </View>
                <View style={{ height: 18, justifyContent: 'center' }}>
                    <Skeleton width={120} height={14} borderRadius={4} />
                </View>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({

    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 16,
    },

    textContainer: {
        flex: 1,
    },

    greetingText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },

    subtitleText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },

    iconButton: {
        position: 'relative',
        padding: 8,
        borderRadius: 50,
    },

    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1.5,
        borderColor: colors.border,
    },

});
