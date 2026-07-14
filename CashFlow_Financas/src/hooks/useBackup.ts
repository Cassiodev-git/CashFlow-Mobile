import { useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import type { ExportFormat, ExportPeriod } from '@/components/ExportConfigModal/ExportConfigModal';

export function useBackup() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const fetchTransactions = async (period: ExportPeriod) => {
        return Array.from({ length: 5000 }, (_, i) => ({
            id: String(i),
            description: `Transação de Teste ${i}`,
            amount: parseFloat((Math.random() * 1000).toFixed(2)),
            type: Math.random() > 0.5 ? 'income' : 'expense',
            date: '2026-07-13',
            category: 'Alimentação'
        }));
    };

    const runDiagnostics = () => {
        const fs = FileSystem as any;
        const info = {
            hasFileSystem: !!fs,
            documentDirectory: fs?.documentDirectory || 'nulo',
            cacheDirectory: fs?.cacheDirectory || 'nulo',
            writeAsStringAsync: !!fs?.writeAsStringAsync
        };

        console.log('Diagnóstico do FileSystem:', info);

        if (!fs?.documentDirectory && !fs?.cacheDirectory) {
            Alert.alert(
                'Falha de Conexão Nativa',
                'O código nativo do FileSystem não foi carregado pelo aplicativo. Certifique-se de rebuildar o aplicativo ou limpar o cache do Expo.'
            );
            return false;
        }
        return true;
    };

    const exportData = async (type: ExportFormat, period: ExportPeriod) => {
        if (!runDiagnostics()) return;

        const fs = FileSystem as any;
        const targetDir = fs.documentDirectory || fs.cacheDirectory;

        setIsExporting(true);
        try {
            const data = await fetchTransactions(period);
            const fileName = `Backup_CashFlow_${period}_${Date.now()}`;

            if (type === 'json') {
                const jsonString = JSON.stringify(data, null, 2);
                const fileUri = `${targetDir}${fileName}.json`;
                
                await fs.writeAsStringAsync(fileUri, jsonString, { encoding: fs.EncodingType.UTF8 });
                await Sharing.shareAsync(fileUri);
            } 
            
            else if (type === 'csv') {
                const csvString = Papa.unparse(data);
                const fileUri = `${targetDir}${fileName}.csv`;
                
                await fs.writeAsStringAsync(fileUri, csvString, { encoding: fs.EncodingType.UTF8 });
                await Sharing.shareAsync(fileUri);
            } 
            
            else if (type === 'pdf') {
                const rowsHtml = data.map(item => `
                    <tr>
                        <td>${item.date}</td>
                        <td>${item.description}</td>
                        <td>${item.category}</td>
                        <td style="color: ${item.type === 'income' ? '#2e7d32' : '#c62828'}">
                            ${item.type === 'income' ? '+' : '-'} R$ ${item.amount.toFixed(2)}
                        </td>
                    </tr>
                `).join('');

                const htmlContent = `
                    <html>
                        <head>
                            <style>
                                body { font-family: sans-serif; padding: 20px; }
                                h1 { text-align: center; color: #333; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                                th { background-color: #f5f5f5; }
                            </style>
                        </head>
                        <body>
                            <h1>Relatório de Transações - CashFlow</h1>
                            <table>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Valor</th>
                                </tr>
                                ${rowsHtml}
                            </table>
                        </body>
                    </html>
                `;

                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                await Sharing.shareAsync(uri);
            }

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            Alert.alert('Erro', 'Não foi possível exportar seus dados.');
        } finally {
            setIsExporting(false);
        }
    };

    const importData = async () => {
        setIsImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/comma-separated-values', 'text/csv'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileName = result.assets[0].name;
            const fs = FileSystem as any;
            const fileContent = await fs.readAsStringAsync(fileUri, { encoding: fs.EncodingType.UTF8 });

            if (fileName.endsWith('.json')) {
                const parsedData = JSON.parse(fileContent);
                Alert.alert('Sucesso', `${parsedData.length} transações importadas via JSON!`);
            } else if (fileName.endsWith('.csv')) {
                const parsedCsv = Papa.parse(fileContent, { header: true });
                Alert.alert('Sucesso', `${parsedCsv.data.length} transações importadas via CSV!`);
            }

        } catch (error) {
            console.error('Erro ao importar dados:', error);
            Alert.alert('Erro', 'Arquivo inválido ou corrompido.');
        } finally {
            setIsImporting(false);
        }
    };

    return { exportData, importData, isExporting, isImporting };
}