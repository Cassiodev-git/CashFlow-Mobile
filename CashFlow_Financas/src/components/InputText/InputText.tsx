import { StyleSheet, TextInput, TextInputProps, View, Text } from "react-native";
//cores
import { colors } from "@/theme";
//hooks

type InputTextProps = TextInputProps & {
    error?: string
}

export function InputText({ style, error, ...rest}: InputTextProps){ 
    return (
        <View style={styles.container}>
            <TextInput
            placeholderTextColor={colors.placeholder}
            style={[styles.input, style, error && styles.inputError]}
            {...rest}
            />
            {error && (
                <Text style={styles.erroText} >
                    {error}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "90%",
        gap: 4,
    },
    input: {
        width: "100%",
        minHeight: 48,
        paddingHorizontal: 14,
        backgroundColor: colors.inputBackground,
        borderColor: colors.inputBorder,
        color: colors.textPrimary,
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 14
    },
    inputError: {
        borderColor: colors.inputBorderError
    },
    erroText: {
        color: colors.danger
    }
})
