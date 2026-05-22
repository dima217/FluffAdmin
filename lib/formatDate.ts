import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDateRu(
  date: Date | string,
  pattern = "dd MMM yyyy"
): string {
  return format(new Date(date), pattern, { locale: ru });
}

export function formatDateTimeRu(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy · HH:mm", { locale: ru });
}

export function formatChatDateLabel(date: Date): string {
  if (isToday(date)) return "Сегодня";
  if (isYesterday(date)) return "Вчера";
  return format(date, "d MMMM yyyy", { locale: ru });
}
