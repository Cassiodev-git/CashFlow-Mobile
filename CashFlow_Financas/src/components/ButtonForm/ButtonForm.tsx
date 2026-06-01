import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Box, Text, scale } from "@/theme/unistyles";

type ButtonProps = TouchableOpacityProps & {
    label: string;
};

export function ButtonForm({ label, style, ...rest }: ButtonProps) {
    return (
        <TouchableOpacity activeOpacity={0.85} {...rest} style={[{ width: "90%" }, style]}>
            <Box
                width="100%"
                minHeight={scale(48)}
                backgroundColor="primary"
                borderRadius="m"
                alignItems="center"
                justifyContent="center"
            >
                <Text 
                    variant="body" 
                    fontWeight="600" 
                    color="textInverse"
                >
                    {label}
                </Text>
            </Box>
        </TouchableOpacity>
    );
}
