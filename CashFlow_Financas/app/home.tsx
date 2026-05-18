import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>CashFlow</Text>
                <Text style={styles.subtitle}>Resumo financeiro</Text>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.cardLabel}>Saldo atual</Text>
                <Text style={styles.balanceValue}>R$ 0,00</Text>
            </View>

            <View style={styles.row}>
                <View style={styles.summaryCard}>
                    <Text style={styles.cardLabel}>Entradas</Text>
                    <Text style={styles.incomeValue}>R$ 0,00</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.cardLabel}>Saídas</Text>
                    <Text style={styles.expenseValue}>R$ 0,00</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
        padding: 24,
        paddingTop: 72,
        backgroundColor: colors.background,
    },
    header: {
        gap: 4,
        marginBottom: 8,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 28,
        fontWeight: "700",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    balanceCard: {
        gap: 8,
        padding: 20,
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    cardLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "500",
    },
    balanceValue: {
        color: colors.textInverse,
        fontSize: 32,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        gap: 8,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    incomeValue: {
        color: colors.income,
        fontSize: 18,
        fontWeight: "700",
    },
    expenseValue: {
        color: colors.expense,
        fontSize: 18,
        fontWeight: "700",
    },
});
