// Bondly App Configuration
export const APP_CONFIG = {
  name: 'Bondly',
  version: '0.1.0',
  description: 'A social connection platform for Gen Z',
  defaultLanguage: 'en',
  supportedLanguages: ['en'] as const,
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  upload: {
    maxFileSizeMB: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
