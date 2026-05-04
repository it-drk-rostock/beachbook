import { Pressable, View } from "react-native";
import { IconRun, IconUsers, IconWalk } from "@tabler/icons-react-native";
import { useCSSVariable } from "uniwind";
import { Typography } from "@/components/typography";
import { TowerStatusIcon } from "@/components/tower-status-icon";

type TowerStatus =
  | "lifeguard_on_duty"
  | "use_caution_when_swimming"
  | "beach_closed"
  | "closed";

type TowerdayStatus = "none" | "open" | "completed";

interface TowerCardProps {
  name: string;
  number: number;
  locationName?: string;
  main: boolean;
  status: TowerStatus;
  memberCount?: number;
  showMemberCount?: boolean;
  towerdayStatus?: TowerdayStatus;
  dutyNames?: string[];
  preparedNames?: string[];
  onPress?: () => void;
}

const towerdayBadge: Record<TowerdayStatus, { label: string }> = {
  none: { label: "Turmbuch nicht eröffnet" },
  open: { label: "Turmbuch eröffnet" },
  completed: { label: "Turmbuch abgeschlossen" },
};

export function TowerCard({
  name,
  number,
  locationName,
  main,
  status,
  memberCount = 0,
  showMemberCount = true,
  towerdayStatus,
  dutyNames,
  preparedNames,
  onPress,
}: TowerCardProps) {
  const memberIconColor =
    (useCSSVariable("--color-on-surface-variant") as string) || "#6b7280";
  const badge = towerdayStatus ? towerdayBadge[towerdayStatus] : null;
  const hasDuty = dutyNames && dutyNames.length > 0;
  const hasPrepared = preparedNames && preparedNames.length > 0;

  return (
    <Pressable
      className="rounded-2xl border border-outline-variant bg-surface p-4 active:opacity-80"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Typography variant="title-large" bold>
            {name} {number} · {locationName ?? "–"}
          </Typography>

          <View className="flex-row flex-wrap items-center gap-2 mt-2">
            {main && (
              <View className="rounded-full bg-on-surface px-2.5 py-1">
                <Typography
                  variant="label-small"
                  bold
                  className="text-surface uppercase"
                >
                  Hauptturm
                </Typography>
              </View>
            )}
            {!main && (
              <View className="rounded-full border border-outline-variant px-2.5 py-1">
                <Typography
                  variant="label-small"
                  bold
                  className="text-on-surface-variant uppercase"
                >
                  Nebenturm
                </Typography>
              </View>
            )}
            {badge && (
              <View className="rounded-full bg-badge px-2.5 py-1">
                <Typography variant="label-small" bold className="text-on-badge">
                  {badge.label}
                </Typography>
              </View>
            )}
            {showMemberCount && (
              <View className="flex-row items-center gap-1">
                <IconUsers size={14} color={memberIconColor} />
                <Typography
                  variant="label-small"
                  className="text-on-surface-variant"
                >
                  {memberCount}
                </Typography>
              </View>
            )}
          </View>
        </View>

        <TowerStatusIcon status={status} size={32} />
      </View>

      {towerdayStatus === "open" && (
        <View className="mt-3 flex-row gap-2 border-t border-outline-variant pt-3">
          <View className="flex-1 rounded-xl bg-duty-container/30 px-3 py-2">
            <View className="flex-row items-center gap-1.5 mb-1">
              <IconRun size={14} color="#2e7d32" />
              <Typography variant="label-small" bold className="text-on-duty-container">
                Im Dienst
              </Typography>
            </View>
            <Typography variant="body-small" bold className="text-on-duty-container" numberOfLines={1}>
              {hasDuty ? dutyNames.join(", ") : "–"}
            </Typography>
          </View>
          <View className="flex-1 rounded-xl bg-prepared-container/30 px-3 py-2">
            <View className="flex-row items-center gap-1.5 mb-1">
              <IconWalk size={14} color="#f57f17" />
              <Typography variant="label-small" bold className="text-on-prepared-container">
                Bereitschaft
              </Typography>
            </View>
            <Typography variant="body-small" bold className="text-on-prepared-container" numberOfLines={1}>
              {hasPrepared ? preparedNames.join(", ") : "–"}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  );
}
