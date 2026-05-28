import { colors } from "@/theme";
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, Text } from "react-native";
type ButtonProps = TouchableOpacityProps & {
    label: string
}
export function ButtonForm({label, style, ...rest}: ButtonProps){
    return(
        <TouchableOpacity style={[styles.button, style]} activeOpacity={0.85} {...rest}>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button: {
        width: "90%",
        minHeight: 48,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: "600",
    }
})
