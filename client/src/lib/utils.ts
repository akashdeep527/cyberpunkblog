import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Extract plain text from HTML
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Create a slug from a string
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format currency
export function formatCurrency(amount: number): string {
  return `$${(amount / 100).toFixed(2)}`;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Generate random neon color
export function getRandomNeonColor(): string {
  const neonColors = [
    'rgb(255, 42, 109)', // neonPink
    'rgb(5, 217, 232)',  // neonBlue
    'rgb(157, 78, 221)', // neonPurple
    'rgb(57, 255, 20)'   // neonGreen
  ];
  return neonColors[Math.floor(Math.random() * neonColors.length)];
}

// Generate avatar URL from username
export function generateAvatarUrl(username: string): string {
  return `https://avatars.dicebear.com/api/identicon/${username}.svg`;
}
