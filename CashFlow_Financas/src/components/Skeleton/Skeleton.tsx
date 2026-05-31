import React, { useMemo } from 'react';
import { DimensionValue } from 'react-native';
import { MotiView } from 'moti';
import { Box } from '@/theme/unistyles';

interface SkeletonProps {
    width: DimensionValue; 
    height: DimensionValue;
    borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
    const transition = useMemo(() => ({
        type: 'timing' as const,
        duration: 1000,
        loop: true,
        repeatReverse: true,
    }), []);

    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={transition}
        >
            <Box
                backgroundColor="inputBorder"
                style={{
                    width,
                    height,
                    borderRadius,
                }}
            />
        </MotiView>
    );
}