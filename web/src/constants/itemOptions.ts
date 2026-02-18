import type { TranslationKeys } from '@/i18n';

// Category values stored in DB (always Ukrainian)
const CATEGORY_DB_VALUES = [
    'Аксесуари', 'Активний відпочинок', 'Головоломки', 'Електроніка',
    'Ігрові набори', 'Інтерактивні', 'Книги', 'Конструктори',
    'Ляльки', 'Машинки', "М'які іграшки", 'Музика', 'Навчання',
    'Настільні ігри', 'Наука', 'Одяг', 'Пазли', 'Роботи',
    'Розвиваючі', 'Спорт', 'Творчість', 'Транспорт', 'Фігурки', 'Інше',
] as const;

// Maps DB value → translation key
const CATEGORY_KEY_MAP: Record<string, TranslationKeys> = {
    'Аксесуари': 'category_accessories',
    'Активний відпочинок': 'category_outdoor',
    'Головоломки': 'category_puzzles',
    'Електроніка': 'category_electronics',
    'Ігрові набори': 'category_playSets',
    'Інтерактивні': 'category_interactive',
    'Книги': 'category_books',
    'Конструктори': 'category_constructors',
    'Ляльки': 'category_dolls',
    'Машинки': 'category_cars',
    "М'які іграшки": 'category_softToys',
    'Музика': 'category_music',
    'Навчання': 'category_learning',
    'Настільні ігри': 'category_boardGames',
    'Наука': 'category_science',
    'Одяг': 'category_clothing',
    'Пазли': 'category_jigsaw',
    'Роботи': 'category_robots',
    'Розвиваючі': 'category_educational',
    'Спорт': 'category_sport',
    'Творчість': 'category_creativity',
    'Транспорт': 'category_transport',
    'Фігурки': 'category_figures',
    'Інше': 'category_other',
};

const AGE_DB_VALUES = ['0-1', '1-3', '3-5', '5-8', '8-12', '12+'] as const;
const AGE_KEY_MAP: Record<string, TranslationKeys> = {
    '0-1': 'age_0_1',
    '1-3': 'age_1_3',
    '3-5': 'age_3_5',
    '5-8': 'age_5_8',
    '8-12': 'age_8_12',
    '12+': 'age_12plus',
};

const TYPE_DB_VALUES = ['exchange', 'gift', 'exchange_or_gift'] as const;
const TYPE_KEY_MAP: Record<string, TranslationKeys> = {
    'exchange': 'type_exchange',
    'gift': 'type_gift',
    'exchange_or_gift': 'type_exchangeOrGift',
};

const CONDITION_DB_VALUES = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;
const CONDITION_KEY_MAP: Record<string, TranslationKeys> = {
    'NEW': 'condition_NEW',
    'LIKE_NEW': 'condition_LIKE_NEW',
    'GOOD': 'condition_GOOD',
    'FAIR': 'condition_FAIR',
    'POOR': 'condition_POOR',
};

const GENDER_DB_VALUES = ['BOY', 'GIRL', 'UNISEX'] as const;
const GENDER_KEY_MAP: Record<string, TranslationKeys> = {
    'BOY': 'gender_BOY',
    'GIRL': 'gender_GIRL',
    'UNISEX': 'gender_UNISEX',
};

// ── Localized option generators ─────────────────────────────────────────

type TFn = (key: TranslationKeys) => string;

export function getCategoryOptions(t: TFn) {
    return [
        { value: '', label: t('category_select') },
        ...CATEGORY_DB_VALUES.map((val) => ({
            value: val,
            label: t(CATEGORY_KEY_MAP[val]),
        })),
    ];
}

export function getAgeOptions(t: TFn) {
    return [
        { value: '', label: t('age_select') },
        ...AGE_DB_VALUES.map((val) => ({
            value: val,
            label: t(AGE_KEY_MAP[val]),
        })),
    ];
}

export function getTypeOptions(t: TFn) {
    return [
        { value: '', label: t('type_select') },
        ...TYPE_DB_VALUES.map((val) => ({
            value: val,
            label: t(TYPE_KEY_MAP[val]),
        })),
    ];
}

export function getConditionOptions(t: TFn) {
    return CONDITION_DB_VALUES.map((val) => ({
        value: val,
        label: t(CONDITION_KEY_MAP[val]),
    }));
}

export function getGenderOptions(t: TFn) {
    return [
        { value: '', label: t('gender_select') },
        ...GENDER_DB_VALUES.map((val) => ({
            value: val,
            label: t(GENDER_KEY_MAP[val]),
        })),
    ];
}

// ── Localized label getters ─────────────────────────────────────────

export function getConditionLabel(t: TFn, value: string): string {
    return CONDITION_KEY_MAP[value] ? t(CONDITION_KEY_MAP[value]) : value;
}

export function getCategoryLabel(t: TFn, value: string): string {
    return CATEGORY_KEY_MAP[value] ? t(CATEGORY_KEY_MAP[value]) : value;
}

export function getAgeLabel(t: TFn, value: string): string {
    return AGE_KEY_MAP[value] ? t(AGE_KEY_MAP[value]) : value;
}

export function getTypeLabel(t: TFn, value: string): string {
    return TYPE_KEY_MAP[value] ? t(TYPE_KEY_MAP[value]) : value;
}

export function getGenderLabel(t: TFn, value: string): string {
    return GENDER_KEY_MAP[value] ? t(GENDER_KEY_MAP[value]) : value;
}
