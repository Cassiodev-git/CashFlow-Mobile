import React from 'react';
import { StyleSheet, DimensionValue } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '@/theme';

interface SkeletonProps {
    width: DimensionValue; 
    height: DimensionValue;
    borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
                repeatReverse: true,
            }}
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.inputBorder,
    },
});