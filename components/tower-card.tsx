import { Pressable, View } from "react-native";
import { IconUsers } from "@tabler/icons-react-native";
import { Typography } from "@/components/typography";
import { TowerStatusIcon } from "@/components/tower-status-icon";

type TowerStatus =
  | "lifeguard_on_duty"
  | "use_caution_when_swimming"
  | "beach_closed"
  | "closed";

interface TowerCardProps {
  name: string;
  number: number;
  locationName?: string;
  main: boolean;
  status: TowerStatus;
  memberCount?: number;
  showMemberCount?: boolean;
  onPress?: () => void;
}

export function TowerCard({
  name,
  number,
  locationName,
  main,
  status,
  memberCount = 0,
  showMemberCount = true,
  onPress,
}: TowerCardProps) {
  return (
    <Pressable
      className="rounded-2xl bg-surface-container p-4 active:opacity-80"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Typography variant="title-large" bold>
            {name} {number} · {locationName ?? "–"}
          </Typography>

          <View className="flex-row items-center gap-2 mt-2">
            {main && (
              <View className="rounded-full bg-on-surface px-2.5 py-1">
                <Typography
                  variant="label-small"
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
                  className="text-on-surface-variant uppercase"
                >
                  Nebenturm
                </Typography>
              </View>
            )}
            {showMemberCount && (
              <View className="flex-row items-center gap-1">
                <IconUsers size={14} color="#41484F" />
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
    </Pressable>
  );
}
