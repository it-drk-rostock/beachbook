import { useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { IconClock, IconTrash, IconX } from "@tabler/icons-react-native";
import { Timeline, type TimelineEventProps } from "react-native-calendars";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { SectionHeader } from "@/components/section-header";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";

const DUTY_EVENT_COLOR = "#a5d6a7";
const PREPARED_EVENT_COLOR = "#ffe082";
const TIMELINE_START = 7;
const TIMELINE_END = 19;
const HOUR_BLOCK_HEIGHT = 100;
const TIMELINE_HEIGHT =
  (TIMELINE_END - TIMELINE_START) * HOUR_BLOCK_HEIGHT + 10;

type ShiftType = "duty" | "prepared";

interface Guard {
  id: string;
  name: string;
  role: "guard" | "guardleader" | "towerleader";
}

interface Shift {
  id: string;
  guardId: string;
  type: ShiftType;
  start: number;
  end: number;
}

interface TowerdayDienstplanProps {
  towerdayId: string;
  organizationId: string;
  shifts: Shift[];
  guards: Guard[];
}

const pad = (n: number) => n.toString().padStart(2, "0");

const formatTime = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const TIMELINE_THEME = {
  calendarBackground: "transparent",
  event: { borderRadius: 8, borderWidth: 0, paddingLeft: 8, paddingTop: 6 },
  nowIndicatorLine: { backgroundColor: "#008CCD" },
  nowIndicatorKnob: { backgroundColor: "#008CCD" },
  timeLabel: { color: "#41484F", fontSize: 10 },
  line: { backgroundColor: "rgba(0,0,0,0.06)" },
  verticalLine: { backgroundColor: "rgba(0,0,0,0.06)" },
} as const;

const DUTY_TIMELINE_THEME = {
  ...TIMELINE_THEME,
  eventTitle: { color: "#1b5e20", fontSize: 13, fontWeight: "700" as const },
  eventTimes: { color: "rgba(27,94,32,0.7)", fontSize: 10 },
};

const PREPARED_TIMELINE_THEME = {
  ...TIMELINE_THEME,
  eventTitle: { color: "#3e2723", fontSize: 13, fontWeight: "700" as const },
  eventTimes: { color: "rgba(62,39,35,0.7)", fontSize: 10 },
};

export function TowerdayDienstplan({
  towerdayId,
  organizationId,
  shifts,
  guards,
}: TowerdayDienstplanProps) {
  const db = useDb();

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const guardNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of guards) map.set(g.id, g.name);
    return map;
  }, [guards]);

  const dutyShifts = useMemo(
    () => shifts.filter((s) => s.type === "duty"),
    [shifts],
  );
  const preparedShifts = useMemo(
    () => shifts.filter((s) => s.type === "prepared"),
    [shifts],
  );

  const toTimelineEvent = (
    shift: Shift,
    color: string,
  ): TimelineEventProps => {
    const start = new Date(shift.start);
    const end = new Date(shift.end);
    return {
      id: shift.id,
      start: `${today} ${pad(start.getHours())}:${pad(start.getMinutes())}:00`,
      end: `${today} ${pad(end.getHours())}:${pad(end.getMinutes())}:00`,
      title: guardNameById.get(shift.guardId) ?? "–",
      color,
    };
  };

  const [addDraft, setAddDraft] = useState<{
    type: ShiftType;
    guardId: string;
    startTime: Date;
    endTime: Date;
  }>({
    type: "duty" as ShiftType,
    guardId: "",
    startTime: new Date(new Date().setHours(8, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
  });
  const [showAddStartPicker, setShowAddStartPicker] = useState(
    Platform.OS === "ios",
  );
  const [showAddEndPicker, setShowAddEndPicker] = useState(
    Platform.OS === "ios",
  );

  const [editState, setEditState] = useState<{
    id: string;
    type: ShiftType;
    guardId: string;
    startTime: Date;
    endTime: Date;
  } | null>(null);
  const [showEditStartPicker, setShowEditStartPicker] = useState(
    Platform.OS === "ios",
  );
  const [showEditEndPicker, setShowEditEndPicker] = useState(
    Platform.OS === "ios",
  );

  const openAddSheet = (type: ShiftType) => {
    setAddDraft({
      type,
      guardId: "",
      startTime: new Date(new Date().setHours(8, 0, 0, 0)),
      endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    });
    setShowAddStartPicker(Platform.OS === "ios");
    setShowAddEndPicker(Platform.OS === "ios");
    TrueSheet.present("duty-plan-add-shift");
  };

  const openEditSheet = (shift: Shift) => {
    setEditState({
      id: shift.id,
      type: shift.type,
      guardId: shift.guardId,
      startTime: new Date(shift.start),
      endTime: new Date(shift.end),
    });
    setShowEditStartPicker(Platform.OS === "ios");
    setShowEditEndPicker(Platform.OS === "ios");
    TrueSheet.present("duty-plan-edit-shift");
  };

  const handleAddStartChange = (_e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowAddStartPicker(false);
    if (d) setAddDraft((prev) => ({ ...prev, startTime: d }));
  };

  const handleAddEndChange = (_e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowAddEndPicker(false);
    if (d) setAddDraft((prev) => ({ ...prev, endTime: d }));
  };

  const handleEditStartChange = (_e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowEditStartPicker(false);
    if (d) setEditState((prev) => (prev ? { ...prev, startTime: d } : prev));
  };

  const handleEditEndChange = (_e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setShowEditEndPicker(false);
    if (d) setEditState((prev) => (prev ? { ...prev, endTime: d } : prev));
  };

  const submitAdd = async () => {
    if (!addDraft.guardId) return;
    db.insert(app.shifts, {
      towerdayId,
      organizationId,
      guardId: addDraft.guardId,
      type: addDraft.type,
      start: addDraft.startTime.getTime(),
      end: addDraft.endTime.getTime(),
    });
    await TrueSheet.dismiss("duty-plan-add-shift");
  };

  const submitEdit = async () => {
    if (!editState) return;
    db.update(app.shifts, editState.id, {
      guardId: editState.guardId,
      start: editState.startTime.getTime(),
      end: editState.endTime.getTime(),
    });
    await TrueSheet.dismiss("duty-plan-edit-shift");
    setEditState(null);
  };

  const deleteShift = async () => {
    if (!editState) return;
    db.delete(app.shifts, editState.id);
    await TrueSheet.dismiss("duty-plan-edit-shift");
    setEditState(null);
  };

  return (
    <>
      <SectionHeader>Dienstplan</SectionHeader>

      <Spacer size="item" />

      {/* Dienst */}
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase"
          >
            Dienst
          </Typography>
          <Pressable
            onPress={() => openAddSheet("duty")}
            className="rounded-lg border border-duty bg-transparent px-3 py-1.5 active:opacity-80"
          >
            <Typography
              variant="label-small"
              bold
              className="text-on-duty-container"
            >
              + Hinzufügen
            </Typography>
          </Pressable>
        </View>
        <View
          className="overflow-hidden rounded-2xl border border-outline-variant bg-surface"
          style={{ height: TIMELINE_HEIGHT }}
        >
          <Timeline
            date={today}
            events={dutyShifts.map((s) =>
              toTimelineEvent(s, DUTY_EVENT_COLOR),
            )}
            start={TIMELINE_START}
            end={TIMELINE_END}
            format24h
            timelineLeftInset={60}
            onEventPress={(event) => {
              const shift = dutyShifts.find((s) => s.id === event.id);
              if (shift) openEditSheet(shift);
            }}
            theme={DUTY_TIMELINE_THEME}
          />
        </View>
      </View>

      <Spacer size="group" />

      {/* Bereitschaft */}
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase"
          >
            Bereitschaft
          </Typography>
          <Pressable
            onPress={() => openAddSheet("prepared")}
            className="rounded-lg border border-prepared bg-transparent px-3 py-1.5 active:opacity-80"
          >
            <Typography
              variant="label-small"
              bold
              className="text-on-prepared-container"
            >
              + Hinzufügen
            </Typography>
          </Pressable>
        </View>
        <View
          className="overflow-hidden rounded-2xl border border-outline-variant bg-surface"
          style={{ height: TIMELINE_HEIGHT }}
        >
          <Timeline
            date={today}
            events={preparedShifts.map((s) =>
              toTimelineEvent(s, PREPARED_EVENT_COLOR),
            )}
            start={TIMELINE_START}
            end={TIMELINE_END}
            format24h
            timelineLeftInset={60}
            onEventPress={(event) => {
              const shift = preparedShifts.find(
                (s) => s.id === event.id,
              );
              if (shift) openEditSheet(shift);
            }}
            theme={PREPARED_TIMELINE_THEME}
          />
        </View>
      </View>

      {/* Add shift sheet */}
      <TrueSheet
        name="duty-plan-add-shift"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              {addDraft.type === "duty" ? "Dienst" : "Bereitschaft"} eintragen
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface active:opacity-70"
              onPress={() => TrueSheet.dismiss("duty-plan-add-shift")}
            >
              <IconX size={16} color="#41484F" />
            </Pressable>
          </View>

          <Spacer size="group" />

          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase mb-1"
          >
            Person
          </Typography>
          <Pressable
            onPress={() => TrueSheet.present("duty-plan-pick-person-add")}
            className="border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
          >
            <Typography
              variant="body-large"
              bold={!!addDraft.guardId}
              className={
                addDraft.guardId
                  ? "text-on-surface"
                  : "text-muted-foreground"
              }
            >
              {guardNameById.get(addDraft.guardId) ?? "Person wählen"}
            </Typography>
          </Pressable>

          <Spacer size="item" />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Von
              </Typography>
              {Platform.OS === "android" && !showAddStartPicker ? (
                <Pressable
                  onPress={() => setShowAddStartPicker(true)}
                  className="flex-row items-center gap-2 border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
                >
                  <IconClock size={18} color="#41484F" />
                  <Typography variant="body-large" bold>
                    {formatTime(addDraft.startTime)}
                  </Typography>
                </Pressable>
              ) : null}
              {showAddStartPicker && (
                <DateTimePicker
                  value={addDraft.startTime}
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  onChange={handleAddStartChange}
                  style={{ alignSelf: "flex-start" }}
                />
              )}
            </View>
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Bis
              </Typography>
              {Platform.OS === "android" && !showAddEndPicker ? (
                <Pressable
                  onPress={() => setShowAddEndPicker(true)}
                  className="flex-row items-center gap-2 border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
                >
                  <IconClock size={18} color="#41484F" />
                  <Typography variant="body-large" bold>
                    {formatTime(addDraft.endTime)}
                  </Typography>
                </Pressable>
              ) : null}
              {showAddEndPicker && (
                <DateTimePicker
                  value={addDraft.endTime}
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "compact" : "default"}
                  onChange={handleAddEndChange}
                  style={{ alignSelf: "flex-start" }}
                />
              )}
            </View>
          </View>

          <Spacer size="group" />

          <Button fullWidth onPress={submitAdd}>
            Übernehmen
          </Button>
        </View>
      </TrueSheet>

      {/* Edit shift sheet */}
      <TrueSheet
        name="duty-plan-edit-shift"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
        onDidDismiss={() => setEditState(null)}
      >
        {editState && (
          <View style={{ padding: 24, paddingTop: 8 }}>
            <View className="flex-row items-center justify-between">
              <Typography variant="title-large" bold>
                {editState.type === "duty" ? "Dienst" : "Bereitschaft"}{" "}
                bearbeiten
              </Typography>
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface active:opacity-70"
                onPress={() => TrueSheet.dismiss("duty-plan-edit-shift")}
              >
                <IconX size={16} color="#41484F" />
              </Pressable>
            </View>

            <Spacer size="group" />

            <Typography
              variant="label-small"
              bold
              className="text-on-surface-variant uppercase mb-1"
            >
              Person
            </Typography>
            <Pressable
              onPress={() =>
                TrueSheet.present("duty-plan-pick-person-edit")
              }
              className="border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
            >
              <Typography
                variant="body-large"
                bold={!!editState.guardId}
                className={
                  editState.guardId
                    ? "text-on-surface"
                    : "text-muted-foreground"
                }
              >
                {guardNameById.get(editState.guardId) ?? "Person wählen"}
              </Typography>
            </Pressable>

            <Spacer size="item" />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Typography
                  variant="label-small"
                  bold
                  className="text-on-surface-variant uppercase mb-1"
                >
                  Von
                </Typography>
                {Platform.OS === "android" && !showEditStartPicker ? (
                  <Pressable
                    onPress={() => setShowEditStartPicker(true)}
                    className="flex-row items-center gap-2 border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
                  >
                    <IconClock size={18} color="#41484F" />
                    <Typography variant="body-large" bold>
                      {formatTime(editState.startTime)}
                    </Typography>
                  </Pressable>
                ) : null}
                {showEditStartPicker && (
                  <DateTimePicker
                    value={editState.startTime}
                    mode="time"
                    is24Hour
                    display={Platform.OS === "ios" ? "compact" : "default"}
                    onChange={handleEditStartChange}
                    style={{ alignSelf: "flex-start" }}
                  />
                )}
              </View>
              <View className="flex-1">
                <Typography
                  variant="label-small"
                  bold
                  className="text-on-surface-variant uppercase mb-1"
                >
                  Bis
                </Typography>
                {Platform.OS === "android" && !showEditEndPicker ? (
                  <Pressable
                    onPress={() => setShowEditEndPicker(true)}
                    className="flex-row items-center gap-2 border border-outline-variant bg-surface rounded-md px-5 py-3.5 active:opacity-80"
                  >
                    <IconClock size={18} color="#41484F" />
                    <Typography variant="body-large" bold>
                      {formatTime(editState.endTime)}
                    </Typography>
                  </Pressable>
                ) : null}
                {showEditEndPicker && (
                  <DateTimePicker
                    value={editState.endTime}
                    mode="time"
                    is24Hour
                    display={Platform.OS === "ios" ? "compact" : "default"}
                    onChange={handleEditEndChange}
                    style={{ alignSelf: "flex-start" }}
                  />
                )}
              </View>
            </View>

            <Spacer size="group" />

            <Button fullWidth onPress={submitEdit}>
              Speichern
            </Button>

            <Spacer size="compact" />

            <Button variant="danger-light" fullWidth onPress={deleteShift}>
              <View className="flex-row items-center gap-2">
                <IconTrash size={18} color="#BA1A1A" />
                <Typography variant="label-large" bold className="text-error">
                  Löschen
                </Typography>
              </View>
            </Button>
          </View>
        )}
      </TrueSheet>

      {/* Person picker — add */}
      <TrueSheet
        name="duty-plan-pick-person-add"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Typography variant="title-large" bold>
            Person wählen
          </Typography>
          <Spacer size="group" />
          {guards.length === 0 ? (
            <View className="rounded-2xl border border-outline-variant bg-surface p-4">
              <Typography
                variant="body-large"
                className="text-on-surface-variant"
              >
                Noch keine Wachgänger eingetragen.
              </Typography>
            </View>
          ) : (
            <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
              {guards.map((guard, index) => (
                <View key={guard.id}>
                  <Pressable
                    className={`p-4 active:opacity-70 ${
                      addDraft.guardId === guard.id
                        ? addDraft.type === "duty"
                          ? "bg-duty-container/30"
                          : "bg-prepared-container/30"
                        : ""
                    }`}
                    onPress={() => {
                      setAddDraft((prev) => ({
                        ...prev,
                        guardId: guard.id,
                      }));
                      TrueSheet.dismiss("duty-plan-pick-person-add");
                    }}
                  >
                    <Typography
                      variant="body-large"
                      bold
                      className={
                        addDraft.guardId === guard.id
                          ? addDraft.type === "duty"
                            ? "text-duty"
                            : "text-prepared"
                          : "text-on-surface"
                      }
                    >
                      {guard.name}
                    </Typography>
                  </Pressable>
                  {index < guards.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
        </View>
      </TrueSheet>

      {/* Person picker — edit */}
      <TrueSheet
        name="duty-plan-pick-person-edit"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Typography variant="title-large" bold>
            Person wählen
          </Typography>
          <Spacer size="group" />
          <View className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
            {guards.map((guard, index) => (
              <View key={guard.id}>
                <Pressable
                  className={`p-4 active:opacity-70 ${
                    editState?.guardId === guard.id
                      ? editState?.type === "duty"
                        ? "bg-duty-container/30"
                        : "bg-prepared-container/30"
                      : ""
                  }`}
                  onPress={() => {
                    setEditState((prev) =>
                      prev ? { ...prev, guardId: guard.id } : prev,
                    );
                    TrueSheet.dismiss("duty-plan-pick-person-edit");
                  }}
                >
                  <Typography
                    variant="body-large"
                    bold
                    className={
                      editState?.guardId === guard.id
                        ? editState?.type === "duty"
                          ? "text-duty"
                          : "text-prepared"
                        : "text-on-surface"
                    }
                  >
                    {guard.name}
                  </Typography>
                </Pressable>
                {index < guards.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </View>
      </TrueSheet>
    </>
  );
}
