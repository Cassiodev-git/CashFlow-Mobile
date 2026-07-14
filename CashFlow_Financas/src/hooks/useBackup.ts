import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import Papa from 'papaparse';
import Toast from 'react-native-toast-message';
import { and, gte, lte, desc } from 'drizzle-orm';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import type { ExportFormat, ExportPeriod } from '@/components/ExportConfigModal/ExportConfigModal';

export function useBackup() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const fetchTransactions = async (period: ExportPeriod) => {
        const now = new Date();
        let whereConditions = [];
        const periodStr = period as string;

        if (periodStr === 'current_month') {
            const start = format(startOfMonth(now), 'yyyy-MM-dd');
            const end = format(endOfMonth(now), 'yyyy-MM-dd');
            whereConditions.push(
                gte(transactions.date, start),
                lte(transactions.date, end)
            );
        } else if (periodStr === 'three_months') {
            const start = format(subDays(now, 90), 'yyyy-MM-dd');
            whereConditions.push(gte(transactions.date, start));
        } else if (periodStr === 'current_year') {
            const start = `${now.getFullYear()}-01-01`;
            const end = `${now.getFullYear()}-12-31`;
            whereConditions.push(
                gte(transactions.date, start),
                lte(transactions.date, end)
            );
        }

        const dbResults = await db
            .select()
            .from(transactions)
            .where(and(...whereConditions))
            .orderBy(desc(transactions.date));

        return dbResults.map(item => {
            const fallbackDate = item.updated_at 
                ? format(new Date(item.updated_at), 'yyyy-MM-dd') 
                : format(new Date(), 'yyyy-MM-dd');

            return {
                id: item.id,
                title: item.title,
                description: item.description,
                amount: Number(item.amount),
                type: item.type as 'income' | 'expense',
                date: item.date || fallbackDate,
                user_id: item.user_id,
                category_id: item.category_id,
                status: item.status,
                is_recurring: !!item.is_recurring,
                recurrence_id: item.recurrence_id,
                created_at: item.created_at,
                updated_at: item.updated_at
            };
        });
    };

    const runDiagnostics = () => {
        if (!FileSystem.documentDirectory && !FileSystem.cacheDirectory) {
            Toast.show({
                type: 'error',
                text1: 'Falha de conexão nativa',
                text2: 'Módulo de arquivos não pôde ser carregado.'
            });
            return false;
        }
        return true;
    };

    const sanitizeTransaction = (item: any) => {
        const fallbackDate = item.updated_at 
            ? format(new Date(item.updated_at), 'yyyy-MM-dd') 
            : format(new Date(), 'yyyy-MM-dd');

        return {
            id: item.id || Crypto.randomUUID(),
            title: item.title || item.description || 'Sem título',
            description: item.description || null,
            amount: Number(item.amount) || 0,
            type: (item.type === 'expense' ? 'expense' : 'income') as 'income' | 'expense',
            date: item.date || fallbackDate,
            user_id: item.user_id || 'default_user',
            category_id: item.category_id || (item.category !== 'Geral' ? item.category : null),
            status: (item.status === 'paid' || item.status === 'canceled' || item.status === 'pending') ? (item.status as 'paid' | 'canceled' | 'pending') : 'pending',
            is_recurring: item.is_recurring === 1 || item.is_recurring === '1' || item.is_recurring === true || item.is_recurring === 'true',
            recurrence_id: item.recurrence_id || null,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
        };
    };

    const exportData = async (type: ExportFormat, period: ExportPeriod) => {
        if (!runDiagnostics()) return;

        const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (!targetDir) return;

        setIsExporting(true);
        try {
            const data = await fetchTransactions(period);

            if (data.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Ação não permitida',
                    text2: 'Você não possui transações para exportar.'
                });
                setIsExporting(false);
                return;
            }

            if (type === 'pdf' && data.length < 5) {
                Toast.show({
                    type: 'error',
                    text1: 'Exportação indisponível',
                    text2: 'Adicione pelo menos 5 transações para gerar o PDF.'
                });
                setIsExporting(false);
                return;
            }

            const fileName = `Backup_Finno_${period}_${Date.now()}`;

            if (type === 'json') {
                const jsonString = JSON.stringify(data, null, 2);
                const fileUri = `${targetDir}${fileName}.json`;
                
                await FileSystem.writeAsStringAsync(fileUri, jsonString, { 
                    encoding: FileSystem.EncodingType.UTF8 
                });
                await Sharing.shareAsync(fileUri);
            } 
            
            else if (type === 'csv') {
                const csvString = Papa.unparse(data);
                const fileUri = `${targetDir}${fileName}.csv`;
                
                await FileSystem.writeAsStringAsync(fileUri, csvString, { 
                    encoding: FileSystem.EncodingType.UTF8 
                });
                await Sharing.shareAsync(fileUri);
            } 
            
            else if (type === 'pdf') {
                const rowsHtml = data.map(item => {
                    const statusColors: Record<string, { bg: string; text: string }> = {
                        paid: { bg: '#e8f5e9', text: '#2e7d32' },
                        pending: { bg: '#fff3e0', text: '#ef6c00' },
                        canceled: { bg: '#ffebee', text: '#c62828' }
                    };
                    const currentStatus = item.status || 'pending';
                    const colors = statusColors[currentStatus] || statusColors.pending;

                    let formattedDate = '';
                    if (item.date) {
                        try {
                            const [year, month, day] = item.date.split('-');
                            formattedDate = `${day}/${month}/${year}`;
                        } catch {
                            formattedDate = item.date;
                        }
                    }

                    return `
                        <tr>
                            <td>${formattedDate}</td>
                            <td>
                                <div style="font-weight: bold;">${item.title}</div>
                                ${item.description ? `<div style="font-size: 10px; color: #666;">${item.description}</div>` : ''}
                            </td>
                            <td>${item.category_id || 'Geral'}</td>
                            <td>
                                <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; background-color: ${colors.bg}; color: ${colors.text};">
                                    ${currentStatus.toUpperCase()}
                                </span>
                            </td>
                            <td style="color: ${item.type === 'income' ? '#2e7d32' : '#c62828'}; font-weight: bold; text-align: right;">
                                ${item.type === 'income' ? '+' : '-'} R$ ${item.amount.toFixed(2)}
                            </td>
                        </tr>
                    `;
                }).join('');

                const htmlContent = `
                    <html>
                        <head>
                            <style>
                                body { font-family: sans-serif; padding: 20px; }
                                h1 { text-align: center; color: #333; margin-bottom: 5px; }
                                .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; }
                                th { background-color: #f5f5f5; }
                            </style>
                        </head>
                        <body>
                            <h1>Relatório de Transações - Finno</h1>
                            <div class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Título / Descrição</th>
                                        <th>Categoria</th>
                                        <th>Status</th>
                                        <th style="text-align: right;">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </body>
                    </html>
                `;

                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                await Sharing.shareAsync(uri);
            }

            Toast.show({
                type: 'success',
                text1: 'Sucesso!',
                text2: 'Exportação concluída com êxito.'
            });

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            Toast.show({
                type: 'error',
                text1: 'Ocorreu um erro',
                text2: 'Tente novamente mais tarde. Ok?'
            });
        } finally {
            setIsExporting(false);
        }
    };

    const importData = async () => {
        setIsImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileName = result.assets[0].name.toLowerCase();
            const fileContent = await FileSystem.readAsStringAsync(fileUri, { 
                encoding: FileSystem.EncodingType.UTF8 
            });

            if (fileName.endsWith('.json')) {
                const parsedData = JSON.parse(fileContent);
                
                if (Array.isArray(parsedData)) {
                    const toInsert = parsedData.map(sanitizeTransaction);
                    await db.insert(transactions).values(toInsert);
                    Toast.show({
                        type: 'success',
                        text1: 'Sucesso!',
                        text2: `${parsedData.length} transações importadas via JSON.`
                    });
                } else {
                    throw new Error('Formato JSON inválido.');
                }
            } else if (fileName.endsWith('.csv')) {
                const parsedCsv = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
                
                if (parsedCsv.data && parsedCsv.data.length > 0) {
                    const toInsert = parsedCsv.data.map(sanitizeTransaction);
                    await db.insert(transactions).values(toInsert);
                    Toast.show({
                        type: 'success',
                        text1: 'Sucesso!',
                        text2: `${parsedCsv.data.length} transações importadas via CSV.`
                    });
                } else {
                    throw new Error('Formato CSV vazio ou inválido.');
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Arquivo inválido',
                    text2: 'Selecione apenas arquivos .json ou .csv gerados pelo Finno.'
                });
            }

        } catch (error) {
            console.error('Erro ao importar dados:', error);
            Toast.show({
                type: 'error',
                text1: 'Ocorreu um erro',
                text2: 'Tente novamente mais tarde. Ok?'
            });
        } finally {
            setIsImporting(false);
        }
    };

    return { exportData, importData, isExporting, isImporting };
}