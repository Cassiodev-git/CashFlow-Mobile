import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
//icons
import { Feather } from '@expo/vector-icons';
//graphs
import { CartesianChart, Line, Area, Pie, PolarChart } from "victory-native";
//colors
import { colors } from '@/theme'; 
//responsiv
import { ScaledSheet } from '@/utils/responsive';


const LINE_DATA = [
    { day: "1", revenue: 2500, expense: 1800 },
    { day: "5", revenue: 3200, expense: 2200 },
    { day: "10", revenue: 2800, expense: 2400 },
    { day: "15", revenue: 4500, expense: 2100 },
    { day: "20", revenue: 3800, expense: 2800 },
    { day: "25", revenue: 5200, expense: 2500 },
    { day: "30", revenue: 4800, expense: 2300 },
];


const PIE_DATA = [
    { label: "Moradia", value: 35, color: "#2D6A4F" },
    { label: "Alimentação", value: 25, color: "#FF9F1C" },
    { label: "Transporte", value: 15, color: "#3A86FF" },
    { label: "Lazer", value: 10, color: "#FFD60A" },
    { label: "Outros", value: 15, color: "#80ED99" },
];

export default function ReportsScreen() {
    const [selectedTab, setSelectedTab] = useState('Mês');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Text style={styles.title}>Gráficos</Text>
            <Text style={styles.subtitle}>Acompanhe sua evolução financeira</Text>
        </View>

        <View style={styles.tabContainer}>
            {['Semana', 'Mês', '3 Meses', 'Ano'].map((tab) => (
            <TouchableOpacity 
                key={tab} 
                onPress={() => setSelectedTab(tab)}
                style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
            >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
            ))}
        </View>

        <View style={styles.card}>
            <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Receitas vs Despesas</Text>
            </View>

            <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.legendText}>Receitas</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                <Text style={styles.legendText}>Despesas</Text>
            </View>
            </View>

            <View style={styles.chartHeight}>
            <CartesianChart 
                data={LINE_DATA} 
                xKey="day" 
                yKeys={["revenue", "expense"]}
                padding={10}
            >
                {({ points, chartBounds }) => (
                <>

                    <Area 
                    points={points.revenue} 
                    y0={chartBounds.bottom} 
                    color="#2ecc71" 
                    opacity={0.1} 
                    curveType="natural"
                    />
                    <Line points={points.revenue} color="#2ecc71" strokeWidth={3} curveType="natural" />

                    <Area 
                    points={points.expense} 
                    y0={chartBounds.bottom} 
                    color="#e74c3c" 
                    opacity={0.1} 
                    curveType="natural"
                    />
                    <Line points={points.expense} color="#e74c3c" strokeWidth={3} curveType="natural" />
                </>
                )}
            </CartesianChart>
            </View>
        </View>


        <View style={[styles.card, { marginBottom: 100 }]}>
            <Text style={styles.cardTitle}>Distribuição de despesas</Text>
            
            <View style={styles.row}>

            <View style={styles.donutContainer}>
                <PolarChart
                data={PIE_DATA}
                colorKey="color"
                valueKey="value"
                labelKey="label"
                >
                <Pie.Chart innerRadius={50} />
                </PolarChart>
            </View>

            <View style={styles.categoryLegend}>
                {PIE_DATA.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryLabel}>{item.label}</Text>
                    <Text style={styles.categoryValue}>{item.value}%</Text>
                </View>
                ))}
            </View>
            </View>
        </View>
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB', padding: 20 },
    header: { marginTop: 40, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    
    tabContainer: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 12, padding: 4, },
    tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    tabButtonActive: { backgroundColor: '#FFF', elevation: 2 },
    tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
    tabTextActive: { color: '#1A1A1A' },

    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    monthText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

    legendContainer: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#666' },

    chartHeight: { height: 220, width: '100%' },

    row: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    donutContainer: { width: 140, height: 140 },
    categoryLegend: { flex: 1, marginLeft: 20, gap: 10 },
    categoryItem: { flexDirection: 'row', alignItems: 'center' },
    categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    categoryLabel: { flex: 1, fontSize: 13, color: '#444' },
    categoryValue: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
});