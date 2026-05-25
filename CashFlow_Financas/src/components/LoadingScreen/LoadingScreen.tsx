import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { MotiView } from 'moti';
import { ScaledSheet } from '@/utils/responsive';
import { colors } from '@/theme';

export function LoadingScreen() {
    return (
        <View style={styles.container}>
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600 }}
            style={styles.logoContainer}
        >
            <Image
            source={require('@/assets/Logo_CashFlow.png')}
            style={styles.logo}
            resizeMode="contain"
            />
        </MotiView>

        <ActivityIndicator 
            size="small" 
            color={colors.primaryDark || '#2ecc71'} 
            style={styles.spinner} 
        />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '200@ms', 
        height: '200@ms',
    },
    spinner: {
        position: 'absolute',
        bottom: '80@ms', 
    },
});