import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function isValidPhoneNumber(phone) {
    const normalized = String(phone || '').trim();
    if (!normalized) return true;

    return /^0\d{9}$/.test(normalized) && !/^(\d)\1{9}$/.test(normalized);
}
