import { SupportTicketStatus } from "@/lib/features/admin/adminApi";

export const TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: "Открыт",
  [SupportTicketStatus.IN_PROGRESS]: "В работе",
  [SupportTicketStatus.RESOLVED]: "Решён",
  [SupportTicketStatus.CLOSED]: "Закрыт",
};

export function matchesSearch(query: string, ...values: Array<string | number | null | undefined>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(q)
  );
}
