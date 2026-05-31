import React from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { MotiView } from 'moti';
import { Box, scale } from '@/theme/unistyles';

export function LoadingScreen() {
    return (
        <Box 
            flex={1} 
            backgroundColor="background" 
            justifyContent="center" 
            alignItems="center"
        >
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 600 }}
                style={{ alignItems: 'center', justifyContent: 'center' }}
            >
                <Image
                    source={require('@/assets/Logo_CashFlow.png')}
                    style={{
                        width: scale(200),
                        height: scale(200),
                    }}
                    resizeMode="contain"
                />
            </MotiView>

            <ActivityIndicator 
                size="small" 
                // Usando a cor primária direto do nosso tema/design system se disponível, 
                // ou mantendo o fallback padrão do projeto
                color="#2ecc71" 
                style={{
                    position: 'absolute',
                    bottom: scale(80),
                }}
            />
        </Box>
    );
}