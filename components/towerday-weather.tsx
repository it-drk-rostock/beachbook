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
  IconTemperature,
  IconDroplet,
  IconWind,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";

type WindDirection =
  | "north"
  | "east"
  | "south"
  | "west"
  | "north-east"
  | "north-west"
  | "south-east"
  | "south-west";

const windDirectionOptions: {
  value: WindDirection;
  label: string;
  short: string;
}[] = [
  { value: "north", label: "Norden", short: "N" },
  { value: "north-east", label: "Nordosten", short: "NO" },
  { value: "east", label: "Osten", short: "O" },
  { value: "south-east", label: "Südosten", short: "SO" },
  { value: "south", label: "Süden", short: "S" },
  { value: "south-west", label: "Südwesten", short: "SW" },
  { value: "west", label: "Westen", short: "W" },
  { value: "north-west", label: "Nordwesten", short: "NW" },
];

const weatherSchema = z.object({
  airInCelsius: z.string(),
  waterInCelsius: z.string(),
  windInBft: z.string(),
});

type WeatherFormData = z.infer<typeof weatherSchema>;

interface WeatherEntry {
  id: string;
  dateTime: number | Date;
  airInCelsius?: number | null;
  waterInCelsius?: number | null;
  windInBft?: number | null;
  windDirection: WindDirection;
}

interface TowerdayWeatherProps {
  towerdayId: string;
  organizationId: string;
  weather: WeatherEntry[];
}

function formatTime(dateTime: number | Date): string {
  const d = new Date(dateTime);
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function getDirectionLabel(dir: WindDirection) {
  return windDirectionOptions.find((o) => o.value === dir);
}

export function TowerdayWeather({
  towerdayId,
  organizationId,
  weather,
}: TowerdayWeatherProps) {
  const db = useDb();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDirection, setSelectedDirection] =
    useState<WindDirection>("north");

  const form = useForm<WeatherFormData>({
    resolver: zodResolver(weatherSchema),
    defaultValues: { airInCelsius: "", waterInCelsius: "", windInBft: "" },
  });

  const openAdd = () => {
    setEditingId(null);
    form.reset({ airInCelsius: "", waterInCelsius: "", windInBft: "" });
    setSelectedTime(new Date());
    setSelectedDirection("north");
    TrueSheet.present("towerday-weather-form");
  };

  const openEdit = (entry: WeatherEntry) => {
    setEditingId(entry.id);
    form.reset({
      airInCelsius: entry.airInCelsius != null ? String(entry.airInCelsius) : "",
      waterInCelsius:
        entry.waterInCelsius != null ? String(entry.waterInCelsius) : "",
      windInBft: entry.windInBft != null ? String(entry.windInBft) : "",
    });
    setSelectedTime(new Date(entry.dateTime));
    setSelectedDirection(entry.windDirection);
    TrueSheet.present("towerday-weather-form");
  };

  const save = (data: WeatherFormData) => {
    const payload = {
      dateTime: selectedTime.getTime(),
      airInCelsius: data.airInCelsius ? parseInt(data.airInCelsius, 10) : undefined,
      waterInCelsius: data.waterInCelsius
        ? parseInt(data.waterInCelsius, 10)
        : undefined,
      windInBft: data.windInBft ? parseInt(data.windInBft, 10) : undefined,
      windDirection: selectedDirection,
    };

    if (editingId) {
      db.update(app.weather, editingId, payload);
    } else {
      db.insert(app.weather, {
        towerdayId,
        organizationId,
        ...payload,
      });
    }
    TrueSheet.dismiss("towerday-weather-form");
  };

  const deleteEntry = () => {
    if (!editingId) return;
    db.delete(app.weather, editingId);
    TrueSheet.dismiss("towerday-weather-form");
  };

  const sorted = [...weather].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  return (
    <>
      <SectionHeader>Wetter</SectionHeader>

      <Spacer size="item" />

      {sorted.length > 0 ? (
        <>
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {sorted.map((entry, index) => (
              <View key={entry.id}>
                <Pressable
                  className="p-4 active:opacity-70"
                  onPress={() => openEdit(entry)}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <IconClock size={16} color="#6B7280" />
                    <Typography
                      variant="body-large"
                      className="text-on-surface-variant"
                    >
                      {formatTime(entry.dateTime)}
                    </Typography>
                  </View>
                  <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
                    {entry.airInCelsius != null && (
                      <View className="flex-row items-center gap-1">
                        <IconTemperature size={16} color="#008CCD" />
                        <Typography variant="body-large" bold>
                          {entry.airInCelsius} °C
                        </Typography>
                        <Typography
                          variant="body-medium"
                          className="text-on-surface-variant"
                        >
                          Luft
                        </Typography>
                      </View>
                    )}
                    {entry.waterInCelsius != null && (
                      <View className="flex-row items-center gap-1">
                        <IconDroplet size={16} color="#008CCD" />
                        <Typography variant="body-large" bold>
                          {entry.waterInCelsius} °C
                        </Typography>
                        <Typography
                          variant="body-medium"
                          className="text-on-surface-variant"
                        >
                          Wasser
                        </Typography>
                      </View>
                    )}
                    {entry.windInBft != null && (
                      <View className="flex-row items-center gap-1">
                        <IconWind size={16} color="#008CCD" />
                        <Typography variant="body-large" bold>
                          {entry.windInBft} Bft
                        </Typography>
                      </View>
                    )}
                  </View>
                  {entry.windDirection && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <IconWind size={16} color="#008CCD" />
                      <Typography variant="body-large" bold>
                        {getDirectionLabel(entry.windDirection)?.label}
                      </Typography>
                      <Typography
                        variant="body-medium"
                        className="text-on-surface-variant"
                      >
                        ({getDirectionLabel(entry.windDirection)?.short})
                      </Typography>
                    </View>
                  )}
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
              Keine Wetterdaten vorhanden
            </Typography>
          </View>
          <Spacer size="item" />
        </>
      )}

      <Button variant="light" fullWidth onPress={openAdd}>
        <View className="flex-row items-center gap-2">
          <IconPlus size={18} color="#008CCD" />
          <Typography variant="body-large" bold className="text-primary">
            Wetterdaten hinzufügen
          </Typography>
        </View>
      </Button>

      {/* Weather Form Sheet */}
      <TrueSheet
        name="towerday-weather-form"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              {editingId ? "Wetterdaten bearbeiten" : "Wetterdaten erfassen"}
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("towerday-weather-form")}
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

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Luft °C
              </Typography>
              <Controller
                control={form.control}
                name="airInCelsius"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="—"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Wasser °C
              </Typography>
              <Controller
                control={form.control}
                name="waterInCelsius"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="—"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
          </View>

          <Spacer size="item" />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Wind Bft
              </Typography>
              <Controller
                control={form.control}
                name="windInBft"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="—"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Typography
                variant="label-small"
                bold
                className="text-on-surface-variant uppercase mb-1"
              >
                Windrichtung
              </Typography>
              <Pressable
                className="border border-outline-variant bg-surface rounded-md px-5 py-3.5"
                onPress={() =>
                  TrueSheet.present("towerday-weather-direction")
                }
              >
                <Typography
                  variant="body-large"
                  className={
                    selectedDirection
                      ? "text-on-surface"
                      : "text-muted-foreground"
                  }
                >
                  {selectedDirection
                    ? getDirectionLabel(selectedDirection)?.label
                    : "Wählen"}
                </Typography>
              </Pressable>
            </View>
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
                onPress={deleteEntry}
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

      {/* Wind Direction Picker Sheet */}
      <TrueSheet
        name="towerday-weather-direction"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Windrichtung
          </Typography>
          <Spacer size="group" />
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {windDirectionOptions.map((option, index) => (
              <View key={option.value}>
                <Pressable
                  className={`p-4 flex-row items-center gap-3 active:opacity-70 ${
                    option.value === selectedDirection ? "bg-primary/10" : ""
                  }`}
                  onPress={() => {
                    setSelectedDirection(option.value);
                    TrueSheet.dismiss("towerday-weather-direction");
                  }}
                >
                  <Typography variant="body-large" className="flex-1">
                    {option.label} ({option.short})
                  </Typography>
                  {option.value === selectedDirection && (
                    <Typography
                      variant="label-large"
                      className="text-primary"
                    >
                      ✓
                    </Typography>
                  )}
                </Pressable>
                {index < windDirectionOptions.length - 1 && <Divider />}
              </View>
            ))}
          </View>
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("towerday-weather-direction")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>
    </>
  );
}
