import uk from './uk';
import ru from './ru';
import en from './en';

export const translations = { uk, ru, en } as const;
export type Locale = keyof typeof translations;
export type { TranslationKeys } from './uk';
