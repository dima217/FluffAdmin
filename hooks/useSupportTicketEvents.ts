import { useEffect } from "react";
import { supportWs } from "@/lib/support/supportSocket";

export function useSupportTicketEvents(onEvent: () => void) {
  useEffect(() => {
    const handleEvent = () => onEvent();

    const offs = [
      supportWs.on("support:ticket_created", handleEvent),
      supportWs.on("support:ticket_replied", handleEvent),
      supportWs.on("support:ticket_status_updated", handleEvent),
    ];

    return () => {
      offs.forEach((off) => off());
    };
  }, [onEvent]);
}
