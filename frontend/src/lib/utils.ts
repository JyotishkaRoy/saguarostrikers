import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string. Expects UTC (ISO or YYYY-MM-DD); displays in user's local timezone.
 */
export function formatDate(dateString: string): string {
  const iso = dateString?.length === 10 ? `${dateString}T00:00:00.000Z` : dateString;
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time. Expects UTC (ISO); displays in user's local timezone.
 */
export function formatDateTime(dateString: string): string {
  const iso = dateString?.length === 10 ? `${dateString}T00:00:00.000Z` : dateString;
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert YouTube watch/short URL to embed URL so it works in iframes.
 * - youtube.com/watch?v=VIDEO_ID -> youtube.com/embed/VIDEO_ID
 * - youtu.be/VIDEO_ID -> youtube.com/embed/VIDEO_ID
 * - Already embed URL or non-YouTube URL is returned unchanged.
 */
export function toYouTubeEmbedUrl(url: string): string {
  if (!url?.trim()) return url;
  const u = url.trim();
  // Already embed format
  if (/youtube\.com\/embed\//.test(u)) return u;
  // youtube.com/watch?v=VIDEO_ID — extract v= param
  const watchMatch = u.match(/[?&]v=([^&\s#]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // youtu.be/VIDEO_ID
  const shortMatch = u.match(/youtu\.be\/([^?\s#]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return u;
}

/**
 * True if URL should be shown in an iframe (YouTube, Vimeo, etc.); false for direct video files.
 */
export function isEmbedVideoUrl(url: string): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (/youtube\.com\/(embed\/|watch\?)|youtu\.be\//.test(u)) return true;
  if (/vimeo\.com|player\./.test(u)) return true;
  return false;
}

/**
 * Get thumbnail URL for a video. Uses video.thumbnail if set; for YouTube URLs returns
 * YouTube's thumbnail image so the card shows the video image instead of black.
 */
export function getVideoThumbnailUrl(url: string, thumbnail?: string): string | null {
  if (thumbnail?.trim()) return thumbnail.trim();
  if (!url?.trim()) return null;
  const u = url.trim();
  // YouTube: extract video ID and use img.youtube.com
  const embedMatch = u.match(/youtube\.com\/embed\/([^?\s#&]+)/);
  if (embedMatch) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
  const watchMatch = u.match(/[?&]v=([^&\s#]+)/);
  if (watchMatch) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;
  const shortMatch = u.match(/youtu\.be\/([^?\s#]+)/);
  if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;
  return null;
}
