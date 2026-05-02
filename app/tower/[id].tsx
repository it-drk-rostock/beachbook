import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { IconDiamond, IconFileExport } from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TowerStatusIcon } from "@/components/tower-status-icon";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { useUser } from "@/hooks/use-user";

type TowerStatus =
  | "lifeguard_on_duty"
  | "use_caution_when_swimming"
  | "beach_closed"
  | "closed";

const statusOptions: { value: TowerStatus; label: string }[] = [
  { value: "lifeguard_on_duty", label: "Rettungsschwimmer im Dienst" },
  { value: "use_caution_when_swimming", label: "Vorsicht beim Schwimmen" },
  { value: "beach_closed", label: "Strand gesperrt" },
  { value: "closed", label: "Geschlossen" },
];

export default function TowerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const { isAdmin } = useUser();

  const towers = useAll(
    id
      ? app.towers.where({ id }).include({
          location: true,
          organization: true,
        })
      : undefined,
  );
  const tower = towers?.[0];

  const towerdays = useAll(
    tower
      ? app.towerdays.where({ towerId: tower.id })
      : undefined,
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const towerday = towerdays?.find((td) => {
    const tdDate = new Date(td.date);
    tdDate.setHours(0, 0, 0, 0);
    return tdDate.getTime() === today.getTime();
  });

  if (!tower) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pt-2 pb-8"
    >
      <Typography variant="headline-large" bold>
        {tower.name} {tower.number} – {tower.location?.name ?? "–"}
      </Typography>

      <Spacer size="compact" />

      <View className="flex-row flex-wrap items-center gap-2">
        {tower.main ? (
          <View className="rounded-full bg-on-surface px-2.5 py-1">
            <Typography
              variant="label-small"
              bold
              className="text-surface uppercase"
            >
              Hauptturm
            </Typography>
          </View>
        ) : (
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
        {isAdmin && (
          <View className="flex-row items-center gap-1 rounded-full border border-outline-variant px-2.5 py-1">
            <IconDiamond size={12} color="#008CCD" />
            <Typography
              variant="label-small"
              bold
              className="text-primary uppercase"
            >
              Angemeldet als Admin
            </Typography>
          </View>
        )}
      </View>

      <Spacer size="group" />

      <View className="rounded-2xl bg-surface-container p-4">
        <TowerStatusIcon status={tower.status} size={28} />
        <Spacer size="inline" />
        <Typography
          variant="label-small"
          bold
          className="text-on-surface-variant uppercase"
        >
          Status
        </Typography>
        <Spacer size="inline" />
        <Typography variant="title-medium" bold className="text-primary">
          {statusOptions.find((o) => o.value === tower.status)?.label ??
            tower.status}
        </Typography>
      </View>

      <Spacer size="section" />

      <SectionHeader>Schnellaktionen</SectionHeader>

      <Spacer size="item" />

      <View className="flex-row gap-3">
        <Button variant="filled" size="md" className="flex-1">
          <IconFileExport size={18} color="#FFFFFF" />
          <Typography
            variant="label-large"
            bold
            className="text-on-primary ml-2"
          >
            Protokoll
          </Typography>
        </Button>
        <Button
          variant="light"
          size="md"
          className="flex-1"
          onPress={() => TrueSheet.present("tower-change-status")}
        >
          <TowerStatusIcon status={tower.status} size={18} />
          <Typography
            variant="label-large"
            bold
            className="text-primary ml-2"
          >
            Status
          </Typography>
        </Button>
      </View>

      <TrueSheet
        name="tower-change-status"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Status ändern
          </Typography>
          <Spacer size="group" />
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {statusOptions.map((option, index) => (
              <View key={option.value}>
                <Pressable
                  className={`p-4 flex-row items-center gap-3 active:opacity-70 ${option.value === tower.status ? "bg-primary/10" : ""}`}
                  onPress={() => {
                    db.update(app.towers, tower.id, {
                      status: option.value,
                    });
                    TrueSheet.dismiss("tower-change-status");
                  }}
                >
                  <TowerStatusIcon status={option.value} size={22} />
                  <Typography variant="body-large" className="flex-1">
                    {option.label}
                  </Typography>
                  {option.value === tower.status && (
                    <Typography variant="label-large" className="text-primary">
                      ✓
                    </Typography>
                  )}
                </Pressable>
                {index < statusOptions.length - 1 && <Divider />}
              </View>
            ))}
          </View>
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("tower-change-status")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>
    </ScrollView>
  );
}
