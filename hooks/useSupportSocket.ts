import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { supportWs, type WsStatus } from "@/lib/support/supportSocket";

export function useSupportSocket() {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const [status, setStatus] = useState<WsStatus>(supportWs.status);

  useEffect(() => {
    return supportWs.onStatus(setStatus);
  }, []);

  useEffect(() => {
    if (accessToken) {
      supportWs.connect(accessToken);
    } else {
      supportWs.disconnect();
    }
  }, [accessToken]);

  return status;
}
