import { useAll, useSession } from "jazz-tools/react-native";
import { app } from "@/schema";

export function useUser() {
  const session = useSession();

  const membership = useAll(
    session
      ? app.members.where({ user_id: session.user_id }).include({
          organization: true,
        })
      : undefined,
  );

  const member = membership?.[0];
  const organization = member?.organization;

  return {
    isLoading: membership === undefined,
    session,
    member,
    organization,
    isAdmin: member?.role === "admin",
    name: member?.name ?? "?",
    role: member?.role,
  };
}
