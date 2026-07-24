/**
 * Date-only values (transaction dates) are kept in the canonical YYYY-MM-DD
 * format. They must not be parsed with new Date('YYYY-MM-DD'), because that
 * constructor interprets the value as UTC and may change the displayed day.
 */
export function getLocalDateString(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string | null | undefined): Date | null {
    if (!value) return null;

    const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
    ) return null;

    return date;
}

/** SQLite CURRENT_TIMESTAMP is UTC and has no timezone suffix. */
export function parseDatabaseTimestamp(value: string | null | undefined): Date | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDateOnly(value);

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
}
