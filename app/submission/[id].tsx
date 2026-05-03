import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { Spacer } from "@/components/spacer";
import { EmptyState } from "@/components/empty-state";
import { IconClipboardX } from "@tabler/icons-react-native";
import SurveyFormDom from "@/components/survey-form-dom";

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: "Offen", bg: "bg-on-surface/10", text: "text-on-surface-variant" },
  ongoing: { label: "In Bearbeitung", bg: "bg-warning/15", text: "text-warning" },
  completed: { label: "Abgeschlossen", bg: "bg-success/15", text: "text-success" },
};

export default function SubmissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();

  const submissions = useAll(
    id
      ? app.submissions
          .where({ id })
          .include({ protocol: true, tower: true })
      : undefined,
  );
  const submission = submissions?.[0];

  const tower = submission?.tower;
  const locations = useAll(
    tower ? app.locations.where({ id: tower.locationId }) : undefined,
  );
  const location = locations?.[0];

  const handleValueChanged = async (data: object) => {
    if (!submission) return;
    db.update(app.submissions, submission.id, {
      data: data as any,
      status: submission.status === "open" ? "ongoing" : submission.status,
    });
  };

  const handleComplete = async (data: object) => {
    if (!submission) return;
    db.update(app.submissions, submission.id, {
      data: data as any,
      status: "completed",
    });
  };

  if (submissions === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#008CCD" />
      </View>
    );
  }

  if (!submission) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <EmptyState
          icon={<IconClipboardX size={28} color="#BA1A1A" />}
          title="Nicht gefunden"
          description="Diese Einreichung konnte nicht gefunden werden."
        />
      </View>
    );
  }

  const protocolSchema = (submission.protocol?.schema as object) ?? {};
  const hasSchema =
    protocolSchema &&
    typeof protocolSchema === "object" &&
    Object.keys(protocolSchema).length > 0;

  const colors = statusLabels[submission.status] ?? statusLabels.open;

  const dateVal =
    typeof submission.date === "number"
      ? submission.date
      : new Date(submission.date).getTime();
  const formattedDate = new Date(dateVal).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Typography variant="title-large" bold>
              {submission.protocol?.name ?? "–"}
            </Typography>
          </View>
          <View className={`rounded-full px-3 py-1 ${colors.bg}`}>
            <Typography variant="label-small" bold className={colors.text}>
              {colors.label}
            </Typography>
          </View>
        </View>
        <Spacer size="inline" />
        <Typography variant="body-medium" className="text-on-surface-variant">
          {tower?.name ?? "–"} {tower?.number ?? ""}{location ? ` – ${location.name}` : ""}
        </Typography>
        <Spacer size="inline" />
        <Typography variant="body-small" className="text-on-surface-variant">
          {formattedDate}
        </Typography>
      </View>

      {!hasSchema ? (
        <View className="flex-1 px-6 pt-6">
          <EmptyState
            icon={<IconClipboardX size={28} color="#008CCD" />}
            title="Kein Schema"
            description="Für dieses Protokoll wurde noch kein Formular im Designer erstellt."
          />
        </View>
      ) : (
        <SurveyFormDom
          schema={protocolSchema}
          data={(submission.data as object) ?? {}}
          onValueChanged={handleValueChanged}
          onComplete={handleComplete}
          dom={{ style: { flex: 1 } }}
        />
      )}
    </View>
  );
}
