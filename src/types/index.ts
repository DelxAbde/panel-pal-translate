
export type User = {
  id: string;
  username: string;
  email?: string;
  preferences?: UserPreferences;
}

export type UserPreferences = {
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  defaultFont: string;
  defaultFontSize: number;
  defaultTranslationStyle: string;
}

export type Language = {
  code: string;
  name: string;
}

export type Font = {
  name: string;
  value: string;
}

export type TranslationStyle = {
  name: string;
  value: string;
  description: string;
}

export type TranslationJob = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  sourceLanguage: string;
  targetLanguage: string;
  font: string;
  fontSize: number;
  translationStyle: string;
  imageData?: string;
  resultData?: string;
  error?: string;
}
