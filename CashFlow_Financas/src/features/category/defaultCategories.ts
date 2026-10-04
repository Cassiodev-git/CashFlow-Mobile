export const DEFAULT_CATEGORIES = [
    { id: 'default-food', icon: 'food', type: 'expense', translationKey: 'food' },
    { id: 'default-transport', icon: 'bus', type: 'expense', translationKey: 'transport' },
    { id: 'default-home', icon: 'home', type: 'expense', translationKey: 'home' },
    { id: 'default-health', icon: 'heart-pulse', type: 'expense', translationKey: 'health' },
    { id: 'default-education', icon: 'school', type: 'expense', translationKey: 'education' },
    { id: 'default-leisure', icon: 'movie-open-outline', type: 'expense', translationKey: 'entertainment' },
    { id: 'default-shopping', icon: 'shopping-outline', type: 'expense', translationKey: 'shopping' },
    { id: 'default-bills', icon: 'file-document-outline', type: 'expense', translationKey: 'bills' },
    { id: 'default-salary', icon: 'cash', type: 'income', translationKey: 'salary' },
    { id: 'default-investment', icon: 'chart-line', type: 'income', translationKey: 'investment' },
] as const;

export const getDefaultCategories = (t: (key: string) => string) => DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    name: t(`defaultCategories.${category.translationKey}`),
}));
