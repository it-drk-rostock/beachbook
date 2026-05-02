import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconDiamond,
  IconFileExport,
  IconFilePlus,
  IconFileCheck,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TowerStatusIcon } from "@/components/tower-status-icon";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { EmptyState } from "@/components/empty-state";
import { TowerdayGuards } from "@/components/towerday-guards";
import { TowerdayTodos } from "@/components/towerday-todos";
import { TowerdayIncidents } from "@/components/towerday-incidents";
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

  const { todayStart, tomorrowStart } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { todayStart: start.getTime(), tomorrowStart: end.getTime() };
  }, []);

  // Query 1: Tower with location, organization, and today's submissions
  const towers = useAll(
    id
      ? app.towers.where({ id }).include({
          location: true,
          organization: true,
          submissionsViaTower: app.submissions.where({
            date: { gte: todayStart, lt: tomorrowStart },
          }),
        })
      : undefined,
  );
  const tower = towers?.[0];
  const submissions = tower?.submissionsViaTower ?? [];

  // Query 2: Today's towerday with guards (separate for reactivity)
  const towerdays = useAll(
    tower
      ? app.towerdays
          .where({
            towerId: tower.id,
            date: { gte: todayStart, lt: tomorrowStart },
          })
          .include({
            guardsViaTowerday: true,
            todosViaTowerday: true,
            incidentsViaTowerday: true,
          })
      : undefined,
  );
  const towerday = towerdays?.[0];

  const createTowerday = () => {
    if (!tower) return;
    db.insert(app.towerdays, {
      towerId: tower.id,
      organizationId: tower.organizationId,
      date: todayStart,
      isCompleted: false,
    });
  };

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
        {towerday ? (
          <View className="rounded-full bg-primary/10 px-2.5 py-1">
            <Typography variant="label-small" bold className="text-primary">
              {new Date(towerday.date).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Typography>
          </View>
        ) : (
          <View className="rounded-full border border-outline-variant px-2.5 py-1">
            <Typography
              variant="label-small"
              bold
              className="text-on-surface-variant"
            >
              Datum ausstehend
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

      <Spacer size="section" />

      <SectionHeader>Turmbuch</SectionHeader>

      <Spacer size="item" />

      {!towerday ? (
        <EmptyState
          icon={<IconFilePlus size={28} color="#008CCD" />}
          title="Kein Turmbuch"
          description="Für heute wurde noch kein Turmbuch angelegt."
          actionLabel="Turmbuch erstellen"
          onAction={createTowerday}
        />
      ) : (
        <>
          <TowerdayGuards
            towerdayId={towerday.id}
            organizationId={tower.organizationId}
            guards={(towerday.guardsViaTowerday ?? []).map((g) => ({
              id: g.id,
              name: g.name,
              role: g.role,
            }))}
          />

          <Spacer size="group" />

          <TowerdayTodos
            towerdayId={towerday.id}
            organizationId={tower.organizationId}
            todos={(towerday.todosViaTowerday ?? []).map((t) => ({
              id: t.id,
              title: t.title,
              commment: t.commment,
              isCompleted: t.isCompleted,
            }))}
          />

          <Spacer size="group" />

          <TowerdayIncidents
            towerdayId={towerday.id}
            organizationId={tower.organizationId}
            incidents={(towerday.incidentsViaTowerday ?? []).map((i) => ({
              id: i.id,
              description: i.description,
              dateTime: i.dateTime,
            }))}
          />
        </>
      )}

      <Spacer size="section" />

      <SectionHeader>Heutige Protokolle</SectionHeader>

      <Spacer size="item" />

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          icon={<IconFileCheck size={28} color="#008CCD" />}
          title="Keine Protokolle"
          description="Für den heutigen Turmtag wurden noch keine Protokolle erstellt."
          actionLabel="Protokoll erstellen"
          onAction={() => {}}
        />
      ) : null}

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
