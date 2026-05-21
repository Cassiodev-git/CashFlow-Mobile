import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';

import { User } from "@/features/user/types/User";

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

    const translateY = useRef(new Animated.Value(8)).current;

    useEffect(() => {

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();

        let index = 0;

        const interval = setInterval(() => {

            setDisplayedText(
                fullText.slice(0, index + 1)
            );

            index++;

            if (index >= fullText.length) {
                clearInterval(interval);
            }

        }, 35);

        return () => clearInterval(interval);

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

            <TouchableOpacity
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

            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

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
