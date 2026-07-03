import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr.startsWith(todayISO());
}

export function calculateStreak(sessions: { date: string }[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions]
    .map((s) => s.date)
    .sort()
    .reverse();

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = daysBetween(sorted[i], sorted[i + 1]);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
