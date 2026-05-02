import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  IconPlus,
  IconX,
  IconTrash,
  IconClock,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";

const incidentSchema = z.object({
  description: z.string().min(1, "Beschreibung ist erforderlich"),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface Incident {
  id: string;
  description: string;
  dateTime: number | Date;
}

interface TowerdayIncidentsProps {
  towerdayId: string;
  organizationId: string;
  incidents: Incident[];
}

function formatTime(dateTime: number | Date): string {
  const d = new Date(dateTime);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function TowerdayIncidents({
  towerdayId,
  organizationId,
  incidents,
}: TowerdayIncidentsProps) {
  const db = useDb();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: { description: "" },
  });

  const openAdd = () => {
    setEditingId(null);
    form.reset({ description: "" });
    setSelectedTime(new Date());
    TrueSheet.present("towerday-incident-form");
  };

  const openEdit = (incident: Incident) => {
    setEditingId(incident.id);
    form.reset({ description: incident.description });
    setSelectedTime(new Date(incident.dateTime));
    TrueSheet.present("towerday-incident-form");
  };

  const save = (data: IncidentFormData) => {
    if (editingId) {
      db.update(app.incidents, editingId, {
        description: data.description.trim(),
        dateTime: selectedTime.getTime(),
      });
    } else {
      db.insert(app.incidents, {
        towerdayId,
        organizationId,
        description: data.description.trim(),
        dateTime: selectedTime.getTime(),
      });
    }
    TrueSheet.dismiss("towerday-incident-form");
  };

  const deleteIncident = () => {
    if (!editingId) return;
    db.delete(app.incidents, editingId);
    TrueSheet.dismiss("towerday-incident-form");
  };

  const sorted = [...incidents].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  return (
    <>
      <SectionHeader>Vorkommnisse</SectionHeader>

      <Spacer size="item" />

      {sorted.length > 0 ? (
        <>
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {sorted.map((incident, index) => (
              <View key={incident.id}>
                <Pressable
                  className="p-4 flex-row items-center gap-3 active:opacity-70"
                  onPress={() => openEdit(incident)}
                >
                  <IconClock size={18} color="#6B7280" />
                  <Typography
                    variant="body-large"
                    bold
                    className="text-on-surface-variant"
                  >
                    {formatTime(incident.dateTime)}
                  </Typography>
                  <Typography variant="body-large" className="flex-1">
                    {incident.description}
                  </Typography>
                </Pressable>
                {index < sorted.length - 1 && <Divider />}
              </View>
            ))}
          </View>
          <Spacer size="item" />
        </>
      ) : (
        <>
          <View className="rounded-2xl bg-surface-container p-4">
            <Typography
              variant="body-large"
              className="text-on-surface-variant"
            >
              Keine Vorkommnisse vorhanden
            </Typography>
          </View>
          <Spacer size="item" />
        </>
      )}

      <Button variant="light" fullWidth onPress={openAdd}>
        <View className="flex-row items-center gap-2">
          <IconPlus size={18} color="#008CCD" />
          <Typography variant="body-large" bold className="text-primary">
            Vorkommnis hinzufügen
          </Typography>
        </View>
      </Button>

      <TrueSheet
        name="towerday-incident-form"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              {editingId ? "Vorkommnis bearbeiten" : "Vorkommnis melden"}
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("towerday-incident-form")}
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
            Beschreibung
          </Typography>
          <Controller
            control={form.control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Was ist passiert?"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                className="min-h-[80px] items-start"
                error={!!form.formState.errors.description}
              />
            )}
          />
          {form.formState.errors.description && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {form.formState.errors.description.message}
            </Typography>
          )}
          <Spacer size="group" />
          <Typography
            variant="label-small"
            bold
            className="text-on-surface-variant uppercase mb-1"
          >
            Uhrzeit
          </Typography>
          <View className="items-center rounded-md border border-outline-variant bg-surface overflow-hidden">
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (date) setSelectedTime(date);
              }}
              locale="de-DE"
              is24Hour
            />
          </View>
          <Spacer size="group" />
          <Button fullWidth onPress={form.handleSubmit(save)}>
            Übernehmen
          </Button>
          {editingId && (
            <>
              <Spacer size="compact" />
              <Button
                variant="danger-light"
                fullWidth
                onPress={deleteIncident}
              >
                <View className="flex-row items-center gap-2">
                  <IconTrash size={18} color="#BA1A1A" />
                  <Typography variant="label-large" bold className="text-error">
                    Löschen
                  </Typography>
                </View>
              </Button>
            </>
          )}
        </View>
      </TrueSheet>
    </>
  );
}
