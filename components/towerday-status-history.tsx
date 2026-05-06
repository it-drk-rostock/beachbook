import { View } from "react-native";
import { Divider } from "@/components/divider";
import { SectionHeader } from "@/components/section-header";
import { Spacer } from "@/components/spacer";
import { TowerStatusIcon } from "@/components/tower-status-icon";
import { Typography } from "@/components/typography";

type TowerStatus =
  | "lifeguard_on_duty"
  | "use_caution_when_swimming"
  | "beach_closed"
  | "closed";

interface TowerStatusEntry {
  id: string;
  status: TowerStatus;
  dateTime: number | Date;
}

interface TowerdayStatusHistoryProps {
  entries: TowerStatusEntry[];
}

const statusLabels: Record<TowerStatus, string> = {
  lifeguard_on_duty: "Rettungsschwimmer im Dienst",
  use_caution_when_swimming: "Vorsicht beim Schwimmen",
  beach_closed: "Strand gesperrt",
  closed: "Geschlossen",
};

function formatTime(dateTime: number | Date): string {
  return new Date(dateTime).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TowerdayStatusHistory({ entries }: TowerdayStatusHistoryProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  return (
    <>
      <SectionHeader>Status Verlauf</SectionHeader>
      <Spacer size="item" />
      {sorted.length > 0 ? (
        <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
          {sorted.map((entry, index) => (
            <View key={entry.id}>
              <View className="p-4 flex-row items-center gap-3">
                <TowerStatusIcon status={entry.status} size={20} />
                <Typography
                  variant="body-large"
                  bold
                  className="text-on-surface-variant"
                >
                  {formatTime(entry.dateTime)}
                </Typography>
                <Typography variant="body-large" className="flex-1">
                  {statusLabels[entry.status]}
                </Typography>
              </View>
              {index < sorted.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      ) : (
        <View className="rounded-2xl border border-outline-variant bg-surface p-4">
          <Typography variant="body-large" className="text-on-surface-variant">
            Keine Status Einträge vorhanden
          </Typography>
        </View>
      )}
    </>
  );
}
