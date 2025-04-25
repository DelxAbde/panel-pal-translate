
import { Font, Language, TranslationStyle } from "@/types";

export const LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ms', name: 'Malay' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
];

export const FONTS: Font[] = [
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { name: 'Bangers', value: 'Bangers, cursive' },
  { name: 'Wild Words', value: "'Comic Neue', cursive" },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Times New Roman', value: "'Times New Roman', serif" },
];

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];

export const TRANSLATION_STYLES: TranslationStyle[] = [
  { 
    name: 'Bubble Replace', 
    value: 'bubble_replace',
    description: 'Replace text within speech bubbles'
  },
  { 
    name: 'Overlay', 
    value: 'overlay',
    description: 'Place translation as overlay on the original text'
  },
  { 
    name: 'Side-by-Side', 
    value: 'side_by_side',
    description: 'Show translation next to the original'
  },
  { 
    name: 'Tooltip', 
    value: 'tooltip',
    description: 'Show translation on hover'
  },
];

export const DEFAULT_PREFERENCES = {
  defaultSourceLanguage: 'ja',
  defaultTargetLanguage: 'en',
  defaultFont: FONTS[0].value,
  defaultFontSize: 14,
  defaultTranslationStyle: TRANSLATION_STYLES[0].value,
};
