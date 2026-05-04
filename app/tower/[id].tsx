import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconAdjustmentsHorizontal,
  IconDiamond,
  IconFilePlus,
  IconFileCheck,
  IconShieldCheck,
  IconLock,
  IconRun,
  IconWalk,
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
import { TowerdayDienstplan } from "@/components/towerday-dienstplan";
import { TowerdayTodos } from "@/components/towerday-todos";
import { TowerdayIncidents } from "@/components/towerday-incidents";
import { TowerdayWeather } from "@/components/towerday-weather";
import { useUser } from "@/hooks/use-user";
import { useCSSVariable } from "uniwind";

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
  const primaryColor = useCSSVariable("--color-primary") as string;

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
          submissionsViaTower: app.submissions
            .where({ date: { gte: todayStart, lt: tomorrowStart } })
            .include({ protocol: true }),
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
            shiftsViaTowerday: true,
            todosViaTowerday: true,
            incidentsViaTowerday: true,
            weatherViaTowerday: true,
          })
      : undefined,
  );
  const towerday = towerdays?.[0];

  const router = useRouter();

  const protocols = useAll(
    tower
      ? app.protocols.where({ organizationId: tower.organizationId })
      : undefined,
  );

  const now = useMemo(() => Date.now(), []);


  const { currentDutyNames, currentPreparedNames } = useMemo(() => {
    if (!towerday)
      return {
        currentDutyNames: [] as string[],
        currentPreparedNames: [] as string[],
      };

    const current = new Date(now);
    const mins = current.getMinutes();
    current.setMinutes(mins < 30 ? 0 : 30, 0, 0);
    const windowStart = current.getTime();
    const windowEnd = windowStart + 30 * 60 * 1000;

    const shifts = towerday.shiftsViaTowerday ?? [];
    const guards = towerday.guardsViaTowerday ?? [];
    const nameMap = new Map(guards.map((g) => [g.id, g.name]));

    const overlapping = shifts.filter((s) => {
      const start =
        typeof s.start === "number" ? s.start : new Date(s.start).getTime();
      const end = typeof s.end === "number" ? s.end : new Date(s.end).getTime();
      return start < windowEnd && end > windowStart;
    });

    return {
      currentDutyNames: overlapping
        .filter((s) => s.type === "duty")
        .map((s) => nameMap.get(s.guardId) ?? "–"),
      currentPreparedNames: overlapping
        .filter((s) => s.type === "prepared")
        .map((s) => nameMap.get(s.guardId) ?? "–"),
    };
  }, [towerday, now]);

  const createSubmission = async (protocolId: string) => {
    if (!tower) return;
    const result = db.insert(app.submissions, {
      protocolId,
      towerId: tower.id,
      organizationId: tower.organizationId,
      date: Date.now(),
      status: "open" as const,
      data: {},
    });

    const submissionId = result.value.id;
    await TrueSheet.dismiss("tower-select-protocol");

    router.push(`/submission/${submissionId}`);
  };

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
          <View className="flex-row items-center gap-1 rounded-full bg-badge px-2.5 py-1">
            <IconDiamond size={12} color="var(--color-on-badge)" />
            <Typography
              variant="label-small"
              bold
              className="text-on-badge uppercase"
            >
              Angemeldet als Admin
            </Typography>
          </View>
        )}
        {towerday ? (
          <View className="rounded-full bg-badge px-2.5 py-1">
            <Typography variant="label-small" bold className="text-on-badge">
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

      <View className="rounded-2xl border border-outline-variant bg-surface p-4">
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

      <Spacer size="item" />

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-outline-variant bg-surface p-4">
          <IconRun size={28} color="#2e7d32" />
          <Spacer size="inline" />
          <Typography
            variant="label-small"
            bold
            className="text-duty uppercase"
          >
            Dienst
          </Typography>
          <Spacer size="inline" />
          {currentDutyNames.length > 0 ? (
            currentDutyNames.map((name, i) => (
              <Typography key={i} variant="title-medium" bold>
                {name}
              </Typography>
            ))
          ) : (
            <Typography
              variant="title-medium"
              bold
              className="text-on-surface-variant"
            >
              –
            </Typography>
          )}
        </View>
        <View className="flex-1 rounded-2xl border border-outline-variant bg-surface p-4">
          <IconWalk size={28} color="#f57f17" />
          <Spacer size="inline" />
          <Typography
            variant="label-small"
            bold
            className="text-prepared uppercase"
          >
            Bereitschaft
          </Typography>
          <Spacer size="inline" />
          {currentPreparedNames.length > 0 ? (
            currentPreparedNames.map((name, i) => (
              <Typography key={i} variant="title-medium" bold>
                {name}
              </Typography>
            ))
          ) : (
            <Typography
              variant="title-medium"
              bold
              className="text-on-surface-variant"
            >
              –
            </Typography>
          )}
        </View>
      </View>

      <Spacer size="section" />

      <SectionHeader>Schnellaktionen</SectionHeader>

      <Spacer size="item" />

      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface px-3 py-7 active:opacity-80"
          onPress={() => TrueSheet.present("tower-select-protocol")}
        >
          <IconFilePlus size={28} color={primaryColor} />
          <Typography
            variant="label-large"
            bold
            className="text-primary text-center"
          >
            Protokoll erstellen
          </Typography>
        </Pressable>
        <Pressable
          className="flex-1 flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface px-3 py-7 active:opacity-80"
          onPress={() => TrueSheet.present("tower-change-status")}
        >
          <IconAdjustmentsHorizontal size={28} color={primaryColor} />
          <Typography
            variant="label-large"
            bold
            className="text-primary text-center"
          >
            Status ändern
          </Typography>
        </Pressable>
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
      ) : towerday.isCompleted ? (
        <>
          <View className="rounded-2xl border border-outline-variant bg-surface py-12 px-8 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-success/15 mb-4">
              <IconShieldCheck size={32} color="#006D3B" />
            </View>
            <Typography variant="title-large" bold className="text-center">
              Turmbuch abgeschlossen
            </Typography>
            <Typography
              variant="body-medium"
              className="text-on-surface-variant text-center mt-2 leading-5"
            >
              Das Turmbuch für heute wurde erfolgreich abgeschlossen und
              gesperrt.
            </Typography>
            <Spacer size="item" />
            <View className="rounded-full bg-error/15 px-3 py-1 flex-row items-center gap-1.5">
              <IconLock size={14} color="#BA1A1A" />
              <Typography variant="label-large" bold className="text-error">
                Gesperrt
              </Typography>
            </View>
          </View>
          <Spacer size="item" />
          <Button
            variant="outline"
            fullWidth
            onPress={() =>
              db.update(app.towerdays, towerday.id, { isCompleted: false })
            }
          >
            <View className="flex-row items-center gap-2">
              <IconLock size={18} color="#008CCD" />
              <Typography variant="label-large" bold className="text-primary">
                Turmbuch wieder öffnen
              </Typography>
            </View>
          </Button>
        </>
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

          <TowerdayDienstplan
            towerdayId={towerday.id}
            organizationId={tower.organizationId}
            shifts={(towerday.shiftsViaTowerday ?? []).map((s) => ({
              id: s.id,
              guardId: s.guardId,
              type: s.type,
              start:
                typeof s.start === "number"
                  ? s.start
                  : new Date(s.start).getTime(),
              end:
                typeof s.end === "number" ? s.end : new Date(s.end).getTime(),
            }))}
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

          <Spacer size="group" />

          <TowerdayWeather
            towerdayId={towerday.id}
            organizationId={tower.organizationId}
            weather={(towerday.weatherViaTowerday ?? []).map((w) => ({
              id: w.id,
              dateTime: w.dateTime,
              airInCelsius: w.airInCelsius,
              waterInCelsius: w.waterInCelsius,
              windInBft: w.windInBft,
              windDirection: w.windDirection,
            }))}
          />

          <Spacer size="section" />

          <Pressable
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-success px-6 py-4 active:opacity-90"
            onPress={() =>
              db.update(app.towerdays, towerday.id, { isCompleted: true })
            }
          >
            <IconShieldCheck size={20} color="#FFFFFF" />
            <Typography variant="label-large" bold className="text-on-primary">
              Turmbuch abschließen
            </Typography>
          </Pressable>
        </>
      )}

      <Spacer size="section" />

      <SectionHeader>Heutige Protokolle</SectionHeader>

      <Spacer size="item" />

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          icon={<IconFileCheck size={28} color={primaryColor} />}
          title="Keine Protokolle"
          description="Für den heutigen Turmtag wurden noch keine Protokolle erstellt."
          actionLabel="Protokoll erstellen"
          onAction={() => TrueSheet.present("tower-select-protocol")}
        />
      ) : (
        <View className="gap-2">
          {submissions.map((sub) => {
            const colors = {
              open: {
                bg: "bg-on-surface/10",
                text: "text-on-surface-variant",
                label: "Offen",
              },
              ongoing: {
                bg: "bg-warning/15",
                text: "text-warning",
                label: "In Bearbeitung",
              },
              completed: {
                bg: "bg-success/15",
                text: "text-success",
                label: "Abgeschlossen",
              },
            }[sub.status] ?? {
              bg: "bg-on-surface/10",
              text: "text-on-surface-variant",
              label: sub.status,
            };

            return (
              <Pressable
                key={sub.id}
                className="rounded-2xl border border-outline-variant bg-surface p-4 active:opacity-80"
                onPress={() => router.push(`/submission/${sub.id}` as any)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="mr-3 flex-1">
                    <Typography variant="title-medium" bold>
                      {sub.protocol?.name ?? "–"}
                    </Typography>
                  </View>
                  <View className={`rounded-full px-2.5 py-0.5 ${colors.bg}`}>
                    <Typography
                      variant="label-small"
                      bold
                      className={colors.text}
                    >
                      {colors.label}
                    </Typography>
                  </View>
                </View>
              </Pressable>
            );
          })}
          <Spacer size="compact" />
          <Pressable
            className="w-full flex-row items-center justify-center gap-2 rounded-xl border border-primary bg-surface px-4 py-4 active:opacity-80"
            onPress={() => TrueSheet.present("tower-select-protocol")}
          >
            <IconFilePlus size={22} color={primaryColor} />
            <Typography variant="label-large" bold className="text-primary">
              Weiteres Protokoll
            </Typography>
          </Pressable>
        </View>
      )}

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
          <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
            {statusOptions.map((option, index) => (
              <View key={option.value}>
                <Pressable
                  className={`p-4 flex-row items-center gap-3 active:opacity-70 ${option.value === tower.status ? "bg-badge" : ""}`}
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

      {/* Protocol selection sheet */}
      <TrueSheet
        name="tower-select-protocol"
        detents={["auto", 0.7]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Protokoll auswählen
          </Typography>
          <Spacer size="group" />
          {!protocols || protocols.length === 0 ? (
            <View className="rounded-2xl border border-outline-variant bg-surface p-4">
              <Typography
                variant="body-large"
                className="text-on-surface-variant"
              >
                Keine Protokolle vorhanden
              </Typography>
            </View>
          ) : (
            <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
              {protocols.map((protocol, index) => (
                <View key={protocol.id}>
                  <Pressable
                    className="p-4 active:opacity-70"
                    onPress={() => createSubmission(protocol.id)}
                  >
                    <Typography variant="body-large" bold>
                      {protocol.name}
                    </Typography>
                    {protocol.description ? (
                      <>
                        <Spacer size="inline" />
                        <Typography
                          variant="body-small"
                          className="text-on-surface-variant"
                          numberOfLines={1}
                        >
                          {protocol.description}
                        </Typography>
                      </>
                    ) : null}
                  </Pressable>
                  {index < protocols.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("tower-select-protocol")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>
    </ScrollView>
  );
}
