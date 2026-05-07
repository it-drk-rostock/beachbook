import { useCallback } from "react";
import { useDb } from "jazz-tools/react-native";
import { app } from "@/schema";
import { useUser } from "@/hooks/use-user";

interface LogActionOptions {
  towerdayId: string;
  organizationId: string;
  action: string;
  data?: Record<string, unknown>;
}

export function useAuditLog() {
  const db = useDb();
  const { member } = useUser();

  const logAction = useCallback(
    (opts: LogActionOptions) => {
      if (!member) return;

      db.insert(app.auditlog, {
        towerdayId: opts.towerdayId,
        organizationId: opts.organizationId,
        memberId: member.id,
        action: opts.action,
        timestamp: Date.now(),
        data: opts.data ?? {},
      });
    },
    [db, member],
  );

  return { logAction };
}
