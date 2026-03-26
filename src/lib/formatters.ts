import { isToday, isTomorrow, isYesterday, format, parseISO } from "date-fns";

/**
 * Formats a raw user ID or handle into a human-friendly string.
 * Masking long UUIDs with a friendlier format.
 */
export function formatUserHandle(userId: string | null | undefined): string {
  if (!userId) return "Anonymous Explorer";
  // If it's a UUID or long hex string, take the last 4 and prefix it nicely.
  if (userId.length > 20) {
    return `Explorer #${userId.slice(-4).toUpperCase()}`;
  }
  return userId;
}

/**
 * Formats a date or ISO string into a relative human-friendly string.
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  
  return format(d, "MMM d, yyyy");
}

/**
 * Formats points into a clean string (e.g., 1200 -> 1.2k).
 */
export function formatPoints(points: number | null | undefined): string {
  const p = points || 0;
  if (p >= 1000) {
    return `${(p / 1000).toFixed(1)}k XP`;
  }
  return `${p} XP`;
}

/**
 * Formats a 24h time string or Date into 12h format with AM/PM.
 */
export function formatTime12h(date: Date | string | null | undefined): string {
  if (!date) return "00:00";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}
