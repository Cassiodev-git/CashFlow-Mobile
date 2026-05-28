<<<<<<< HEAD
import React, { useMemo } from 'react';
=======
import React from 'react';
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
import { StyleSheet, DimensionValue } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '@/theme';

interface SkeletonProps {
    width: DimensionValue; 
    height: DimensionValue;
    borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
<<<<<<< HEAD
    const transition = useMemo(() => ({
        type: 'timing' as const,
        duration: 1000,
        loop: true,
        repeatReverse: true,
    }), []);

=======
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
<<<<<<< HEAD
            transition={transition}
=======
            transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
                repeatReverse: true,
            }}
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
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
<<<<<<< HEAD
});
=======
});
>>>>>>> 945b444312f7b6a94805c28de1fcfae68c399707
