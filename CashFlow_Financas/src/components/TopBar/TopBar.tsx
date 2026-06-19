import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shopify/restyle';
import { User } from "@/features/user/types/User";
import { Box, Text, type Theme } from '@/theme/unistyles';

let hasAnimatedGlobal = false;

interface TopBarProps {
    user: User | null;
}

export function TopBar({ user }: TopBarProps) {
    const { t } = useTranslation();
    const theme = useTheme<Theme>();
    
    const [text, setText] = useState(hasAnimatedGlobal ? "Finno" : "");
    const [isAnimatingNow, setIsAnimatingNow] = useState(!hasAnimatedGlobal);
    
    const fullGreeting = `${t("greetings.hello")}, ${user?.name ?? ""}`;
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (hasAnimatedGlobal) {
            setText("Finno");
            setIsAnimatingNow(false);
            return;
        }

        hasAnimatedGlobal = true;

        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
            { iterations: 2 }
        ).start();

        let timeout: ReturnType<typeof setTimeout>;
        let currentIndex = 0;
        let deleting = false;

        const typeEffect = () => {
            if (!deleting) {
                setText(fullGreeting.slice(0, currentIndex + 1));
                currentIndex++;
                
                if (currentIndex < fullGreeting.length) {
                    timeout = setTimeout(typeEffect, 100);
                } else {
                    timeout = setTimeout(() => { deleting = true; typeEffect(); }, 8000);
                }
            } else {
                setText(fullGreeting.slice(0, currentIndex - 1));
                currentIndex--;
                
                if (currentIndex > 0) {
                    timeout = setTimeout(typeEffect, 50);
                } else {
                    setText("Finno");
                    setIsAnimatingNow(false);
                }
            }
        };

        timeout = setTimeout(typeEffect, 500);
        return () => clearTimeout(timeout);
    }, [fullGreeting]);

    const waveRotation = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '25deg']
    });

    return (
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingTop="xs" paddingBottom="m">
            <Box flex={1}>
                <Box flexDirection="row" alignItems="center">
                    <Text fontSize={22} fontWeight="700" color="textPrimary" marginBottom="xs">
                        {text}
                    </Text>
                    
                    {isAnimatingNow && text !== "Finno" && text.length > 5 && (
                        <Animated.Text 
                            style={{ 
                                fontSize: 22, 
                                marginLeft: 4, 
                                transform: [{ rotate: waveRotation }, { translateY: -2 }] 
                            }}
                        >
                            👋
                        </Animated.Text>
                    )}
                </Box>
                <Text variant="body" color="textSecondary">
                    {t("greetings.financeSummary")}
                </Text>
            </Box>
        </Box>
    );
}