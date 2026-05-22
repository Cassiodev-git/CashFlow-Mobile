import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Perfil</Text>
                <Text style={styles.subtitle}>Tela de perfil em construcao.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 8,
    },
    title: {
        color: "#000000",
        fontSize: 22,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: "center",
    },
});
