export const ACCEPTED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

export type MimeType = (typeof ACCEPTED_CONTENT_TYPES)[number];

export const CONTENT_EXTENSIONS_MAP: Record<MimeType, 'jpg' | 'png' | 'webp'> =
  {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

export type CreateS3SignedUrlDTO = {
  key: string;
  filename: string;
  mimeType: MimeType;
  size: number;
  metadata: Record<string, string>;
};
