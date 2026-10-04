import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import Papa from 'papaparse';
import Toast from 'react-native-toast-message';
import { DeviceEventEmitter } from 'react-native';
import { and, desc, gte, lte } from 'drizzle-orm';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';
import type { ExportFormat, ExportPeriod } from '@/components/ExportConfigModal/ExportConfigModal';
import { getLocalDateString, parseDatabaseTimestamp } from '@/utils/date';
import AppUserService from '@/services/AppUserService';

type TransactionStatus = 'paid' | 'pending' | 'canceled';

interface BackupTransaction {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    user_id: string;
    category_id: string | null;
    status: TransactionStatus | null;
    is_recurring: boolean;
    recurrence_id: string | null;
    created_at: string;
    updated_at: string;
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] ?? character));

const toDate = (value: string, locale: string) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale).format(date);
};

export function useBackup() {
    const { t, i18n } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const locale = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';

    const showError = (message: string) => Toast.show({ type: 'error', text1: t('feedback.error.title'), text2: message });

    const fetchTransactions = async (period: ExportPeriod): Promise<BackupTransaction[]> => {
        const now = new Date();
        const conditions = [];
        if (period === 'current_month') {
            conditions.push(gte(transactions.date, format(startOfMonth(now), 'yyyy-MM-dd')), lte(transactions.date, format(endOfMonth(now), 'yyyy-MM-dd')));
        } else if (period === 'three_months') {
            conditions.push(gte(transactions.date, format(subDays(now, 90), 'yyyy-MM-dd')));
        } else if (period === 'current_year') {
            conditions.push(gte(transactions.date, `${now.getFullYear()}-01-01`), lte(transactions.date, `${now.getFullYear()}-12-31`));
        }

        const query = db.select().from(transactions).orderBy(desc(transactions.date));
        const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

        return rows.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            amount: Number(item.amount),
            type: item.type === 'expense' ? 'expense' : 'income',
            date: item.date || (parseDatabaseTimestamp(item.updated_at) ? getLocalDateString(parseDatabaseTimestamp(item.updated_at)!) : getLocalDateString()),
            user_id: item.user_id,
            category_id: item.category_id,
            status: item.status as TransactionStatus | null,
            is_recurring: item.is_recurring,
            recurrence_id: item.recurrence_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    };

    const ensureShareAvailable = async () => {
        if (!FileSystem.documentDirectory && !FileSystem.cacheDirectory) {
            showError(t('feedback.file.nativeUnavailable'));
            return false;
        }
        if (!(await Sharing.isAvailableAsync())) {
            showError(t('feedback.file.sharingUnavailable'));
            return false;
        }
        return true;
    };

    const sanitizeTransaction = (item: Record<string, unknown>, currentUserId: string): BackupTransaction => {
        const now = new Date().toISOString();
        const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : now;
        const candidateStatus = item.status;
        const status: TransactionStatus = candidateStatus === 'paid' || candidateStatus === 'canceled' || candidateStatus === 'pending' ? candidateStatus : 'pending';
        return {
            id: typeof item.id === 'string' ? item.id : Crypto.randomUUID(),
            title: typeof item.title === 'string' && item.title.trim() ? item.title : (typeof item.description === 'string' ? item.description : t('backup.untitledTransaction')),
            description: typeof item.description === 'string' ? item.description : null,
            amount: Number(item.amount) || 0,
            type: item.type === 'expense' ? 'expense' : 'income',
            date: typeof item.date === 'string' ? item.date : (parseDatabaseTimestamp(updatedAt) ? getLocalDateString(parseDatabaseTimestamp(updatedAt)!) : getLocalDateString()),
            user_id: currentUserId, // Sobrescreve pelo ID do usuário logado
            category_id: typeof item.category_id === 'string' ? item.category_id : null,
            status,
            is_recurring: item.is_recurring === true || item.is_recurring === 1 || item.is_recurring === '1' || item.is_recurring === 'true',
            recurrence_id: typeof item.recurrence_id === 'string' ? item.recurrence_id : null,
            created_at: typeof item.created_at === 'string' ? item.created_at : now,
            updated_at: updatedAt,
        };
    };

    const buildPdf = async (data: BackupTransaction[]) => {
        const categoryRows = await db.select({ id: categories.id, name: categories.name }).from(categories);
        const categoryNames = new Map(categoryRows.map((category) => [category.id, category.name]));
        const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: locale === 'pt-BR' ? 'BRL' : 'USD' });
        const statusColor: Record<TransactionStatus, { background: string; foreground: string }> = {
            paid: { background: '#e8f5e9', foreground: '#2e7d32' }, pending: { background: '#fff3e0', foreground: '#ef6c00' }, canceled: { background: '#ffebee', foreground: '#c62828' },
        };
        const rows = data.map((item) => {
            const status = item.status ?? 'pending';
            const colors = statusColor[status];
            return `<tr><td>${escapeHtml(toDate(item.date, locale))}</td><td><strong>${escapeHtml(item.title)}</strong>${item.description ? `<br /><span class="description">${escapeHtml(item.description)}</span>` : ''}</td><td>${escapeHtml(categoryNames.get(item.category_id ?? '') ?? t('backup.uncategorized'))}</td><td><span class="status" style="background:${colors.background};color:${colors.foreground}">${escapeHtml(t(`transactions.status.${status}`))}</span></td><td class="amount ${item.type}">${item.type === 'income' ? '+' : '-'} ${formatter.format(item.amount)}</td></tr>`;
        }).join('');
        return `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:Arial,sans-serif;padding:24px;color:#191d29}h1{text-align:center;margin:0}.subtitle{text-align:center;color:#6f7583;font-size:12px;margin:8px 0 20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e5e7eb;padding:9px;text-align:left;font-size:11px}th{background:#f7f8fa}.description{font-size:10px;color:#6f7583}.status{border-radius:4px;padding:3px 6px;font-size:10px;font-weight:bold}.amount{text-align:right;font-weight:bold}.income{color:#2e7d32}.expense{color:#c62828}</style></head><body><h1>${escapeHtml(t('backup.pdf.title'))}</h1><p class="subtitle">${escapeHtml(t('backup.pdf.generatedAt', { date: new Intl.DateTimeFormat(locale).format(new Date()) }))}</p><table><thead><tr><th>${escapeHtml(t('backup.pdf.date'))}</th><th>${escapeHtml(t('backup.pdf.description'))}</th><th>${escapeHtml(t('backup.pdf.category'))}</th><th>${escapeHtml(t('backup.pdf.status'))}</th><th>${escapeHtml(t('backup.pdf.amount'))}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    };

    const exportData = async (type: ExportFormat, period: ExportPeriod) => {
        if (!(await ensureShareAvailable())) return;
        const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (!directory) return;
        setIsExporting(true);
        try {
            const data = await fetchTransactions(period);
            if (data.length === 0) return showError(t('backup.feedback.noTransactions'));
            if (type === 'pdf' && data.length < 5) return showError(t('backup.feedback.minimumPdfTransactions'));
            
            // Padrão americano: AAAA-MM-DD (Exemplo: Finno_backup_2026-07-27.json)
            const formattedDate = format(new Date(), 'yyyy-MM-dd');
            const filename = `Finno_backup_${formattedDate}`;
            
            let uri: string;
            if (type === 'pdf') {
                ({ uri } = await Print.printToFileAsync({ html: await buildPdf(data) }));
            } else {
                const content = type === 'json' ? JSON.stringify(data, null, 2) : Papa.unparse(data);
                uri = `${directory}${filename}.${type}`;
                await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
            }
            await Sharing.shareAsync(uri, { mimeType: type === 'pdf' ? 'application/pdf' : type === 'json' ? 'application/json' : 'text/csv', dialogTitle: t('backup.share.title') });
            Toast.show({ type: 'success', text1: t('feedback.success.title'), text2: t('backup.feedback.exportSuccess') });
        } catch (error) {
            console.error('Backup export failed', error);
            showError(t('backup.feedback.exportError'));
        } finally {
            setIsExporting(false);
        }
    };

    const importData = async () => {
        setIsImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/csv', 'text/comma-separated-values'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets[0]) return;

            const asset = result.assets[0];
            const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });

            let source: Record<string, unknown>[];
            if (asset.name.toLowerCase().endsWith('.json')) {
                const parsed: unknown = JSON.parse(content);
                if (!Array.isArray(parsed)) throw new Error('invalid-json');
                source = parsed as Record<string, unknown>[];
            } else if (asset.name.toLowerCase().endsWith('.csv')) {
                const parsed = Papa.parse<Record<string, unknown>>(content, { header: true, skipEmptyLines: true });
                if (parsed.errors.length > 0 || parsed.data.length === 0) throw new Error('invalid-csv');
                source = parsed.data;
            } else {
                showError(t('backup.feedback.invalidFile'));
                return;
            }

            const currentUser = await AppUserService.findFirstUser();
            if (!currentUser) throw new Error('user-not-found');

            const existingCategories = await db.select({ id: categories.id }).from(categories);
            const categoryIds = new Set(existingCategories.map((category) => category.id));

            const importedTransactions = source.map((item) => {
                const sanitized = sanitizeTransaction(item, currentUser.id);
                return {
                    ...sanitized,
                    category_id: sanitized.category_id && categoryIds.has(sanitized.category_id) ? sanitized.category_id : null,
                    recurrence_id: null,
                };
            });

            // Lotes de 200 itens para suportar 40.000+ transações com folga de memória
            const CHUNK_SIZE = 200;
            await db.transaction(async (tx) => {
                for (let i = 0; i < importedTransactions.length; i += CHUNK_SIZE) {
                    const chunk = importedTransactions.slice(i, i + CHUNK_SIZE);
                    await tx.insert(transactions).values(chunk).onConflictDoNothing();
                }
            });

            DeviceEventEmitter.emit('transaction_mutated');
            Toast.show({ type: 'success', text1: t('feedback.success.title'), text2: t('backup.feedback.importSuccess', { count: source.length }) });
        } catch (error) {
            console.error('Backup import failed', error);
            showError(t('backup.feedback.importError'));
        } finally {
            setIsImporting(false);
        }
    };

    return { exportData, importData, isExporting, isImporting };
}