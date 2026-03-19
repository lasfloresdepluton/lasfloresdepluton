import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in ARS */
export function formatPrice(price: number, type: 'retail' | 'wholesale' = 'retail'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

/** Calculate SLA dispatch date (retail = 2 days, wholesale = 10 days) */
export function getDispatchDate(type: 'retail' | 'wholesale'): Date {
  const days = type === 'retail' ? 2 : 10;
  const date = new Date();
  // Skip weekends
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

/** Check if postal code is in CABA/GBA for moto delivery */
export function isLocalPostalCode(postalCode: string): boolean {
  const code = parseInt(postalCode, 10);
  // CABA: 1000-1499, GBA: 1600-2200 (approximate)
  return (code >= 1000 && code <= 1499) || (code >= 1600 && code <= 2200);
}

/** Generate a slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
