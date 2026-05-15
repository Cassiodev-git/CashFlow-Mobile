import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { colors } from "@/theme";

export function InputText({ style, ...rest }: TextInputProps){
    return (
        <TextInput
            placeholderTextColor={colors.placeholder}
            style={[styles.input, style]}
            {...rest}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        width: "90%",
        minHeight: 48,
        paddingHorizontal: 14,
        backgroundColor: colors.inputBackground,
        borderColor: colors.inputBorder,
        color: colors.textPrimary,
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 14
    }
})
