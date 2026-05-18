import { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { TrueSheet } from "@lodev09/react-native-true-sheet";
import SignatureCanvas from "react-native-signature-canvas";
import {
  IconAdjustmentsHorizontal,
  IconClock,
  IconDiamond,
  IconFilePlus,
  IconFileCheck,
  IconHistory,
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
import { TowerdayStatusHistory } from "@/components/towerday-status-history";
import { TowerdayWeather } from "@/components/towerday-weather";
import { useUser } from "@/hooks/use-user";
import { useAuditLog } from "@/hooks/use-audit-log";
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

  const { isAdmin, role } = useUser();
  const { logAction } = useAuditLog();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const signatureRef = useRef<any>(null);

  const { todayStart, tomorrowStart } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { todayStart: start.getTime(), tomorrowStart: end.getTime() };
  }, []);

  // Single query: tower with all today's data nested as reverse-relation includes.
  // Merging into one subscription fixes child-relation reactivity and removes
  // the query-2-depends-on-query-1 waterfall.
  const towers = useAll(
    id
      ? app.towers.where({ id }).include({
          location: true,
          organization: true,

          submissionsViaTower: app.submissions
            .where({ date: { gte: todayStart, lt: tomorrowStart } })
            .include({ protocol: true }),

          towerdaysViaTower: app.towerdays
            .where({ date: { gte: todayStart, lt: tomorrowStart } })
            .include({
              guardsViaTowerday: true,
              shiftsViaTowerday: true,
              todosViaTowerday: true,
              incidentsViaTowerday: true,
              weatherViaTowerday: true,
              towerstatusesViaTowerday: true,
            }),
        })
      : undefined,
  );
  const tower = towers?.[0];
  const submissions = tower?.submissionsViaTower ?? [];
  const towerday = tower?.towerdaysViaTower?.[0];

  const auditLogs = useAll(
    towerday
      ? app.auditlog
          .where({ towerdayId: towerday.id })
          .include({ member: true })
          .orderBy("timestamp", "desc")
      : undefined,
  );


  const router = useRouter();

  const protocols = useAll(
    tower
      ? app.protocols.where({ organizationId: tower.organizationId })
      : undefined,
  );

  const now = useMemo(() => Date.now(), []);

  const latestStatusTime = useMemo(() => {
    const entries = towerday?.towerstatusesViaTowerday;
    if (!entries || entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => {
      const ta =
        typeof a.dateTime === "number"
          ? a.dateTime
          : new Date(a.dateTime).getTime();
      const tb =
        typeof b.dateTime === "number"
          ? b.dateTime
          : new Date(b.dateTime).getTime();
      return tb - ta;
    });
    return new Date(sorted[0].dateTime).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [towerday?.towerstatusesViaTowerday]);

  const [statusTime, setStatusTime] = useState(new Date());
  const [showStatusTimePicker, setShowStatusTimePicker] = useState(
    Platform.OS === "ios",
  );
  const [activeSignatureRole, setActiveSignatureRole] = useState<
    "towerleader" | "guardleader" | null
  >(null);
  const [hasSignatureInput, setHasSignatureInput] = useState(false);

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const { currentDutyNames, currentPreparedNames } = useMemo(() => {
    if (!towerday)
      return {
        currentDutyNames: [] as string[],
        currentPreparedNames: [] as string[],
      };

    const current = new Date(now);
    current.setMinutes(0, 0, 0);
    const windowStart = current.getTime();
    const windowEnd = windowStart + 60 * 60 * 1000;

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
      date: new Date(),
      status: "open" as const,
      data: {},
    });

    const submissionId = result.value.id;
    await TrueSheet.dismiss("tower-select-protocol");

    router.push(`/submission/${submissionId}`);
  };

  const createTowerday = async () => {
    if (!tower) return;

    // Oneshot query: fetch the most recent previous towerday's incomplete todos
    // at the moment of creation. Must happen before the batch since db.batch()
    // is synchronous and cannot contain async reads.
    const previousTowerdays = await db.all(
      app.towerdays
        .where({ towerId: tower.id, date: { lt: todayStart } })
        .include({ todosViaTowerday: true })
        .orderBy("date", "desc")
        .limit(1),
    );
    const incompleteTodos =
      previousTowerdays?.[0]?.todosViaTowerday?.filter((t) => !t.isCompleted) ??
      [];

    // Group all inserts into a single batch for one atomic local commit.
    const result = db.batch((batch) => {
      const newTowerday = batch.insert(app.towerdays, {
        towerId: tower.id,
        organizationId: tower.organizationId,
        date: new Date(todayStart),
        isCompleted: false,
      });
      batch.insert(app.towerstatuses, {
        towerdayId: newTowerday.id,
        towerId: tower.id,
        organizationId: tower.organizationId,
        status: tower.status,
        dateTime: new Date(),
      });
      for (const todo of incompleteTodos) {
        batch.insert(app.todos, {
          towerdayId: newTowerday.id,
          organizationId: tower.organizationId,
          title: todo.title,
          commment: todo.commment,
          isCompleted: false,
        });
      }

      logAction({
        towerdayId: newTowerday.id,
        organizationId: tower.organizationId,
        action: "towerday_created",
        data: { towerId: tower.id, towerName: tower.name },
      });
    });

    await result.wait({ tier: "local" });
  };

  const handleTowerStatusChange = (nextStatus: TowerStatus) => {
    if (!tower) return;
    if (nextStatus === tower.status) {
      TrueSheet.dismiss("tower-change-status");
      return;
    }

    const previousStatus = tower.status;
    db.update(app.towers, tower.id, { status: nextStatus });

    if (towerday) {
      db.insert(app.towerstatuses, {
        towerdayId: towerday.id,
        towerId: tower.id,
        organizationId: tower.organizationId,
        status: nextStatus,
        dateTime: statusTime,
      });

      logAction({
        towerdayId: towerday.id,
        organizationId: tower.organizationId,
        action: "status_changed",
        data: { from: previousStatus, to: nextStatus },
      });
    }

    TrueSheet.dismiss("tower-change-status");
  };

  const canTowerleaderSign =
    !!towerday &&
    !towerday.isCompleted &&
    !towerday.towerleaderSignature &&
    (role === "towerleader" || isAdmin);

  const canGuardleaderSign =
    !!towerday &&
    !towerday.isCompleted &&
    !!towerday.towerleaderSignature &&
    !towerday.guardleaderSignature &&
    (role === "guardleader" || isAdmin);

  const openSignatureSheet = (nextRole: "towerleader" | "guardleader") => {
    setActiveSignatureRole(nextRole);
    setHasSignatureInput(false);
    TrueSheet.present("towerday-signature");
  };

  const closeSignatureSheet = () => {
    setHasSignatureInput(false);
    setActiveSignatureRole(null);
    TrueSheet.dismiss("towerday-signature");
  };

  const persistSignature = (signature: string) => {
    if (!towerday || !activeSignatureRole || !signature || !tower) return;

    if (activeSignatureRole === "towerleader") {
      db.update(app.towerdays, towerday.id, {
        towerleaderSignature: signature,
      });
      logAction({
        towerdayId: towerday.id,
        organizationId: tower.organizationId,
        action: "towerleader_signed",
      });
    } else {
      db.update(app.towerdays, towerday.id, {
        guardleaderSignature: signature,
        isCompleted: true,
      });
      logAction({
        towerdayId: towerday.id,
        organizationId: tower.organizationId,
        action: "guardleader_signed",
      });
      logAction({
        towerdayId: towerday.id,
        organizationId: tower.organizationId,
        action: "towerday_completed",
      });
    }

    closeSignatureSheet();
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
            <IconDiamond size={12} color="#374151" />
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
        <View className="flex-row items-center justify-between">
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase"
          >
            Status
          </Typography>
          {latestStatusTime && (
            <Typography
              variant="label-small"
              className="text-on-surface-variant"
            >
              seit {latestStatusTime}
            </Typography>
          )}
        </View>
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
          onPress={() => {
            setStatusTime(new Date());
            setShowStatusTimePicker(Platform.OS === "ios");
            TrueSheet.present("tower-change-status");
          }}
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

      {(role === "guardleader" || isAdmin) && towerday && (
        <>
          <Spacer size="item" />
          <Pressable
            className="w-full flex-row items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-4 active:opacity-80"
            onPress={() => TrueSheet.present("towerday-audit-log")}
          >
            <IconHistory size={22} color={primaryColor} />
            <Typography
              variant="label-large"
              bold
              className="text-primary text-center"
            >
              Revision
            </Typography>
          </Pressable>
        </>
      )}

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

            {(towerday.towerleaderSignature || towerday.guardleaderSignature) && (
              <>
                <Spacer size="group" />
                <View className="w-full gap-3">
                  {towerday.towerleaderSignature && (
                    <View className="rounded-xl border border-outline-variant bg-background p-3">
                      <Typography
                        variant="label-small"
                        bold
                        className="text-on-surface-variant uppercase"
                      >
                        Turmleiter-Unterschrift
                      </Typography>
                      <Spacer size="inline" />
                      <View className="h-20 overflow-hidden rounded-lg border border-outline-variant bg-white">
                        <Image
                          source={{ uri: towerday.towerleaderSignature }}
                          resizeMode="contain"
                          className="h-full w-full"
                        />
                      </View>
                    </View>
                  )}
                  {towerday.guardleaderSignature && (
                    <View className="rounded-xl border border-outline-variant bg-background p-3">
                      <Typography
                        variant="label-small"
                        bold
                        className="text-on-surface-variant uppercase"
                      >
                        Wachleiter-Unterschrift
                      </Typography>
                      <Spacer size="inline" />
                      <View className="h-20 overflow-hidden rounded-lg border border-outline-variant bg-white">
                        <Image
                          source={{ uri: towerday.guardleaderSignature }}
                          resizeMode="contain"
                          className="h-full w-full"
                        />
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
          <Spacer size="item" />
          <Button
            variant="outline"
            fullWidth
            onPress={() => {
              db.update(app.towerdays, towerday.id, {
                isCompleted: false,
                guardleaderSignature: "",
              });
              logAction({
                towerdayId: towerday.id,
                organizationId: tower.organizationId,
                action: "towerday_reopened",
              });
            }}
          >
            <View className="flex-row items-center gap-2">
              <IconLock size={18} color="#008CCD" />
              <Typography variant="label-large" bold className="text-primary">
                Turmbuch wieder öffnen
              </Typography>
            </View>
          </Button>
          <Spacer size="group" />
          <TowerdayStatusHistory
            entries={(towerday.towerstatusesViaTowerday ?? []).map((s) => ({
              id: s.id,
              status: s.status,
              dateTime: s.dateTime,
            }))}
          />
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
          <TowerdayStatusHistory
            entries={(towerday.towerstatusesViaTowerday ?? []).map((s) => ({
              id: s.id,
              status: s.status,
              dateTime: s.dateTime,
            }))}
          />

          {tower.main && (
            <>
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
            </>
          )}

          <Spacer size="section" />
          {canTowerleaderSign || canGuardleaderSign ? (
            <View className="w-full gap-3">
              {canTowerleaderSign && (
                <Pressable
                  className="w-full flex-row items-center justify-center gap-2 rounded-lg bg-success px-6 py-4 active:opacity-90"
                  onPress={() => openSignatureSheet("towerleader")}
                >
                  <IconShieldCheck size={20} color="#FFFFFF" />
                  <Typography
                    variant="label-large"
                    bold
                    className="text-on-primary text-center"
                  >
                    Turmbuch abschließen
                  </Typography>
                </Pressable>
              )}
              {canGuardleaderSign && (
                <Pressable
                  className="w-full flex-row items-center justify-center gap-2 rounded-lg bg-success px-6 py-4 active:opacity-90"
                  onPress={() => openSignatureSheet("guardleader")}
                >
                  <IconShieldCheck size={20} color="#FFFFFF" />
                  <Typography
                    variant="label-large"
                    bold
                    className="text-on-primary text-center"
                  >
                    Turmbuch abschließen
                  </Typography>
                </Pressable>
              )}
            </View>
          ) : towerday.towerleaderSignature && !towerday.guardleaderSignature ? (
            <View className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3">
              <Typography
                variant="body-medium"
                className="text-on-surface-variant text-center"
              >
                Turmleiter hat unterschrieben. Wachleiter-Unterschrift steht noch
                aus.
              </Typography>
            </View>
          ) : null}
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
        name="towerday-audit-log"
        detents={[0.5, 1]}
        cornerRadius={24}
        grabber
        scrollable
        backgroundColor="#FFFFFF"
      >
        <ScrollView style={{ padding: 24, paddingTop: 8 }}>
          <Typography variant="title-large" bold>
            Revision
          </Typography>
          <Spacer size="group" />
          {!auditLogs || auditLogs.length === 0 ? (
            <View className="rounded-2xl border border-outline-variant bg-surface p-4">
              <Typography
                variant="body-large"
                className="text-on-surface-variant"
              >
                Noch keine Einträge vorhanden.
              </Typography>
            </View>
          ) : (
            <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
              {auditLogs.map((log, index) => (
                <View key={log.id}>
                  <View className="p-4 gap-1">
                    <View className="flex-row items-center justify-between">
                      <Typography variant="label-large" bold>
                        {log.action}
                      </Typography>
                      <Typography
                        variant="label-small"
                        className="text-on-surface-variant"
                      >
                        {new Date(log.timestamp).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </View>
                    <Typography
                      variant="body-small"
                      className="text-on-surface-variant"
                    >
                      {log.member?.name ?? "–"}
                    </Typography>
                    {log.data &&
                      Object.keys(log.data as object).length > 0 && (
                        <Typography
                          variant="body-small"
                          className="text-on-surface-variant"
                        >
                          {Object.entries(log.data as Record<string, unknown>)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </Typography>
                      )}
                  </View>
                  {index < auditLogs.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
          <Spacer size="group" />
        </ScrollView>
      </TrueSheet>

      <TrueSheet
        name="towerday-signature"
        detents={[0.85]}
        cornerRadius={24}
        grabber
        dimmed
        backgroundColor="#FFFFFF"
        onDidDismiss={() => {
          setHasSignatureInput(false);
          setActiveSignatureRole(null);
        }}
      >
        <View style={{ padding: 24, paddingTop: 8, gap: 16 }}>
          <Typography variant="title-large" bold>
            {activeSignatureRole === "guardleader"
              ? "Wachleiter-Unterschrift"
              : "Turmleiter-Unterschrift"}
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant">
            Bitte unterschreiben, um den Schritt zu bestaetigen.
          </Typography>
          <View className="h-72 overflow-hidden rounded-2xl border border-outline-variant bg-white">
            <SignatureCanvas
              ref={signatureRef}
              onOK={persistSignature}
              onEnd={() => setHasSignatureInput(true)}
              onClear={() => setHasSignatureInput(false)}
              descriptionText=""
              webStyle={`
                .m-signature-pad {box-shadow: none; border: none;}
                .m-signature-pad--footer {display: none; margin: 0px;}
                body,html {height: 100%;}
              `}
            />
          </View>
          <Button
            fullWidth
            disabled={!hasSignatureInput}
            onPress={() => signatureRef.current?.readSignature()}
          >
            Speichern
          </Button>
          <Button
            variant="danger-light"
            fullWidth
            onPress={() => signatureRef.current?.clearSignature()}
          >
            Unterschrift löschen
          </Button>
          <Button variant="secondary" fullWidth onPress={closeSignatureSheet}>
            Abbrechen
          </Button>
        </View>
      </TrueSheet>

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
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase mb-1"
          >
            Uhrzeit
          </Typography>
          {Platform.OS === "android" && !showStatusTimePicker ? (
            <Pressable
              onPress={() => setShowStatusTimePicker(true)}
              className="flex-row items-center gap-2 border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
            >
              <IconClock size={18} color="#41484F" />
              <Typography variant="body-large" bold>
                {formatTime(statusTime)}
              </Typography>
            </Pressable>
          ) : null}
          {showStatusTimePicker && (
            <View className="items-center rounded-md border border-outline-variant bg-surface overflow-hidden">
              <DateTimePicker
                value={statusTime}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, date) => {
                  if (Platform.OS === "android") setShowStatusTimePicker(false);
                  if (date) setStatusTime(date);
                }}
                locale="de-DE"
              />
            </View>
          )}
          <Spacer size="group" />
          <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
            {statusOptions.map((option, index) => (
              <View key={option.value}>
                <Pressable
                  className={`p-4 flex-row items-center gap-3 active:opacity-70 ${option.value === tower.status ? "bg-badge" : ""}`}
                  onPress={() => handleTowerStatusChange(option.value)}
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
