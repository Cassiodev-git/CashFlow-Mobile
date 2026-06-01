import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@shopify/restyle";
import { Box, Text, scale, type Theme } from "@/theme/unistyles";

type InputTextProps = TextInputProps & {
    error?: string
}

export function InputText({ style, error, ...rest}: InputTextProps){ 
    const theme = useTheme<Theme>();

    return (
        <Box width="90%" style={{ gap: scale(4) }}>
            <TextInput
                placeholderTextColor={theme.colors.placeholder}
                style={[
                    {
                        width: "100%",
                        minHeight: scale(48),
                        paddingHorizontal: scale(14),
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: error ? theme.colors.inputBorderError : theme.colors.inputBorder,
                        color: theme.colors.textPrimary,
                        borderWidth: scale(1),
                        borderRadius: scale(8),
                        fontSize: scale(14)
                    },
                    style
                ]}
                {...rest}
            />
            {error && (
                <Text variant="caption" color="danger">
                    {error}
                </Text>
            )}
        </Box>
    )
}
