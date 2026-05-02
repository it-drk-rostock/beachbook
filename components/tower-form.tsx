import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAll, useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconChevronRight,
  IconMapPin,
  IconUser,
  IconUserPlus,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCSSVariable } from "uniwind";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Spacer } from "@/components/spacer";
import { Divider } from "@/components/divider";
import { TowerStatusIcon } from "@/components/tower-status-icon";
import { useUser } from "@/hooks/use-user";
import { app } from "@/schema";

const towerSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  number: z.number().int().min(1, "Turmnummer ist erforderlich"),
  locationId: z.string().min(1, "Standort ist erforderlich"),
  status: z.enum([
    "lifeguard_on_duty",
    "use_caution_when_swimming",
    "beach_closed",
    "closed",
  ]),
  main: z.boolean(),
});

type TowerFormData = z.infer<typeof towerSchema>;

type TowerStatus = TowerFormData["status"];

const statusOptions: { value: TowerStatus; label: string }[] = [
  { value: "lifeguard_on_duty", label: "Rettungsschwimmer im Dienst" },
  { value: "use_caution_when_swimming", label: "Vorsicht beim Schwimmen" },
  { value: "beach_closed", label: "Strand gesperrt" },
  { value: "closed", label: "Geschlossen" },
];

export interface TowerData {
  id: string;
  name: string;
  number: number;
  locationId: string;
  status: TowerStatus;
  main: boolean;
}

interface TowerFormProps {
  organizationId: string;
  tower?: TowerData;
  sheetName: string;
}

export function TowerForm({
  organizationId,
  tower,
  sheetName,
}: TowerFormProps) {
  const db = useDb();
  const { member: currentMember } = useUser();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const outlineColor = useCSSVariable("--color-outline-variant") as string;
  const isEditing = !!tower;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scannerLocked, setScannerLocked] = useState(false);

  const locations = useAll(app.locations.where({ organizationId }));

  const orgMembers = useAll(app.members.where({ organizationId }));

  const towerMembers =
    orgMembers?.filter((m) => tower && m.towerIds?.includes(tower.id)) ?? [];

  const availableMembers =
    orgMembers?.filter((m) => !tower || !m.towerIds?.includes(tower.id)) ?? [];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TowerFormData>({
    resolver: zodResolver(towerSchema),
    defaultValues: {
      name: tower?.name ?? "",
      number: tower?.number ?? 1,
      locationId: tower?.locationId ?? "",
      status: tower?.status ?? "closed",
      main: tower?.main ?? false,
    },
  });

  useEffect(() => {
    if (tower) {
      reset({
        name: tower.name,
        number: tower.number,
        locationId: tower.locationId,
        status: tower.status,
        main: tower.main,
      });
    } else {
      reset({
        name: "",
        number: 1,
        locationId: "",
        status: "closed",
        main: false,
      });
    }
  }, [tower, reset]);

  const selectedLocationId = watch("locationId");
  const selectedStatus = watch("status");
  const selectedLocation = locations?.find((l) => l.id === selectedLocationId);

  const onSubmit = async (data: TowerFormData) => {
    if (isEditing && tower) {
      db.update(app.towers, tower.id, {
        name: data.name,
        number: data.number,
        locationId: data.locationId,
        status: data.status,
        main: data.main,
      });
    } else {
      const newTower = await db
        .insert(app.towers, {
          name: data.name,
          number: data.number,
          locationId: data.locationId,
          organizationId,
          status: data.status,
          main: data.main,
        })
        .wait({ tier: "local" });

      if (currentMember) {
        const currentIds = currentMember.towerIds ?? [];
        db.update(app.members, currentMember.id, {
          towerIds: [...currentIds, newTower.id],
        });
      }
    }

    TrueSheet.dismiss(sheetName);
  };

  const handleDelete = () => {
    if (!tower) return;
    db.delete(app.towers, tower.id);
    TrueSheet.dismiss(sheetName);
  };

  const handleCancel = () => {
    TrueSheet.dismiss(sheetName);
  };

  const addMemberToTower = (memberId: string) => {
    if (!tower) return;
    const member = orgMembers?.find((m) => m.id === memberId);
    if (!member) return;

    const currentIds = member.towerIds ?? [];
    if (currentIds.includes(tower.id)) return;

    db.update(app.members, memberId, {
      towerIds: [...currentIds, tower.id],
    });
  };

  const removeMemberFromTower = (memberId: string) => {
    if (!tower) return;
    const member = orgMembers?.find((m) => m.id === memberId);
    if (!member) return;

    const currentIds = member.towerIds ?? [];
    db.update(app.members, memberId, {
      towerIds: currentIds.filter((id) => id !== tower.id),
    });
  };

  const openMemberScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert("Kamera benötigt", "Bitte erlaube den Kamera-Zugriff.");
        return;
      }
    }
    setScannerLocked(false);
    TrueSheet.present("tower-invite-scanner");
  };

  const parseScannedUserId = (rawData: string) => {
    const trimmed = rawData.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed?.user_id === "string" && parsed.user_id.trim()) {
        return parsed.user_id.trim();
      }
      if (typeof parsed?.userId === "string" && parsed.userId.trim()) {
        return parsed.userId.trim();
      }
    } catch {
      // Not JSON, use raw string
    }

    return trimmed;
  };

  const handleScannedCode = (data: string) => {
    if (scannerLocked || !tower) return;
    setScannerLocked(true);

    const userId = parseScannedUserId(data);
    if (!userId) {
      setScannerLocked(false);
      Alert.alert("Ungültiger QR-Code", "Keine User-ID gefunden.");
      return;
    }

    const member = orgMembers?.find((m) => m.user_id === userId);
    if (!member) {
      setScannerLocked(false);
      Alert.alert(
        "Nicht gefunden",
        "Dieser Nutzer ist kein Mitglied deiner Organisation.",
      );
      return;
    }

    if (member.towerIds?.includes(tower.id)) {
      setScannerLocked(false);
      TrueSheet.dismiss("tower-invite-scanner");
      Alert.alert(
        "Bereits zugewiesen",
        "Dieses Mitglied ist bereits dem Turm zugewiesen.",
      );
      return;
    }

    addMemberToTower(member.id);
    TrueSheet.dismiss("tower-invite-scanner");
    setScannerLocked(false);
  };

  return (
    <>
      <ScrollView>
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            {isEditing ? "Turm bearbeiten" : "Turm erstellen"}
          </Typography>

          <Spacer size="group" />

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.name}
              />
            )}
          />
          {errors.name && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {errors.name.message}
            </Typography>
          )}

          <Spacer size="item" />

          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Turmnummer"
                value={value ? String(value) : ""}
                onChangeText={(t) => onChange(t === "" ? "" : Number(t))}
                onBlur={onBlur}
                keyboardType="number-pad"
                error={!!errors.number}
              />
            )}
          />
          {errors.number && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {errors.number.message}
            </Typography>
          )}

          <Spacer size="item" />

          {/* Location Picker Trigger */}
          <Pressable
            className="flex-row items-center border border-outline-variant bg-surface rounded-md px-5 py-3.5 gap-3"
            onPress={() => TrueSheet.present("tower-pick-location")}
          >
            <IconMapPin size={20} color={primaryColor} />
            <Typography
              variant="body-large"
              className={`flex-1 ${selectedLocation ? "text-on-surface" : "text-muted-foreground"}`}
            >
              {selectedLocation?.name ?? "Standort wählen"}
            </Typography>
            <IconChevronRight size={18} color={outlineColor} />
          </Pressable>
          {errors.locationId && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {errors.locationId.message}
            </Typography>
          )}

          <Spacer size="item" />

          {/* Status Picker Trigger */}
          <Pressable
            className="flex-row items-center border border-outline-variant bg-surface rounded-md px-5 py-3.5 gap-3"
            onPress={() => TrueSheet.present("tower-pick-status")}
          >
            <TowerStatusIcon status={selectedStatus} size={22} />
            <Typography variant="body-large" className="flex-1 text-on-surface">
              {statusOptions.find((o) => o.value === selectedStatus)?.label}
            </Typography>
            <IconChevronRight size={18} color={outlineColor} />
          </Pressable>

          <Spacer size="item" />

          {/* Main Tower Toggle */}
          <Controller
            control={control}
            name="main"
            render={({ field: { value, onChange } }) => (
              <Checkbox checked={value} onChange={onChange} label="Hauptturm" />
            )}
          />

          {/* Members Button (edit mode only) */}
          {isEditing && (
            <>
              <Spacer size="item" />
              <Pressable
                className="flex-row items-center border border-outline-variant bg-surface rounded-md px-5 py-3.5 gap-3"
                onPress={() => TrueSheet.present("tower-members")}
              >
                <IconUsersGroup size={20} color={primaryColor} />
                <Typography
                  variant="body-large"
                  className="flex-1 text-on-surface"
                >
                  Mitglieder verwalten
                </Typography>
                <View className="rounded-full bg-surface-container-high px-2.5 py-0.5">
                  <Typography
                    variant="label-medium"
                    className="text-on-surface-variant"
                  >
                    {towerMembers.length}
                  </Typography>
                </View>
                <IconChevronRight size={18} color={outlineColor} />
              </Pressable>
            </>
          )}

          <Spacer size="group" />

          <Button
            fullWidth
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isEditing ? "Speichern" : "Erstellen"}
          </Button>

          {isEditing && (
            <>
              <Spacer size="compact" />
              <Button variant="danger-light" fullWidth onPress={handleDelete}>
                Turm löschen
              </Button>
            </>
          )}

          <Spacer size="compact" />

          <Button variant="subtle" fullWidth onPress={handleCancel}>
            Abbrechen
          </Button>
        </View>
      </ScrollView>

      {/* Stacking TrueSheet: Location Picker */}
      <TrueSheet
        name="tower-pick-location"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Standort wählen
          </Typography>
          <Spacer size="group" />
          {locations && locations.length > 0 ? (
            <View className="rounded-2xl bg-surface-container overflow-hidden">
              {locations.map((loc, index) => (
                <View key={loc.id}>
                  <Pressable
                    className={`p-4 flex-row items-center gap-3 active:opacity-70 ${loc.id === selectedLocationId ? "bg-primary/10" : ""}`}
                    onPress={() => {
                      setValue("locationId", loc.id);
                      TrueSheet.dismiss("tower-pick-location");
                    }}
                  >
                    <IconMapPin size={20} color={primaryColor} />
                    <Typography variant="body-large" className="flex-1">
                      {loc.name}
                    </Typography>
                    {loc.id === selectedLocationId && (
                      <Typography
                        variant="label-large"
                        className="text-primary"
                      >
                        ✓
                      </Typography>
                    )}
                  </Pressable>
                  {index < locations.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          ) : (
            <Typography
              variant="body-medium"
              className="text-on-surface-variant text-center py-4"
            >
              Keine Standorte vorhanden. Erstelle zuerst einen Standort.
            </Typography>
          )}
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("tower-pick-location")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>

      {/* Stacking TrueSheet: Status Picker */}
      <TrueSheet
        name="tower-pick-status"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Status wählen
          </Typography>
          <Spacer size="group" />
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {statusOptions.map((option, index) => (
              <View key={option.value}>
                <Pressable
                  className={`p-4 flex-row items-center gap-3 active:opacity-70 ${option.value === selectedStatus ? "bg-primary/10" : ""}`}
                  onPress={() => {
                    setValue("status", option.value);
                    TrueSheet.dismiss("tower-pick-status");
                  }}
                >
                  <TowerStatusIcon status={option.value} size={22} />
                  <Typography variant="body-large" className="flex-1">
                    {option.label}
                  </Typography>
                  {option.value === selectedStatus && (
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
            onPress={() => TrueSheet.dismiss("tower-pick-status")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>

      {/* Stacking TrueSheet: Tower Members */}
      <TrueSheet
        name="tower-members"
        detents={[0.85]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Turm-Mitglieder
          </Typography>
          <Spacer size="group" />

          {towerMembers.length > 0 ? (
            <View className="rounded-2xl bg-surface-container overflow-hidden">
              {towerMembers.map((m, index) => (
                <View key={m.id}>
                  <View className="p-4 flex-row items-center gap-3">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <IconUser size={18} color={primaryColor} />
                    </View>
                    <Typography variant="body-large" className="flex-1">
                      {m.name}
                    </Typography>
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
                      onPress={() => removeMemberFromTower(m.id)}
                    >
                      <IconX size={16} color="#BA1A1A" />
                    </Pressable>
                  </View>
                  {index < towerMembers.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          ) : (
            <View className="rounded-2xl bg-surface-container p-4 items-center">
              <Typography
                variant="body-medium"
                className="text-on-surface-variant"
              >
                Noch keine Mitglieder zugewiesen.
              </Typography>
            </View>
          )}

          <Spacer size="group" />

          {/* Add from existing org members */}
          {availableMembers.length > 0 && (
            <>
              <Typography
                variant="label-large"
                className="text-on-surface-variant mb-2"
              >
                Mitglied hinzufügen
              </Typography>
              <View className="rounded-2xl bg-surface-container overflow-hidden">
                {availableMembers.map((m, index) => (
                  <View key={m.id}>
                    <Pressable
                      className="p-4 flex-row items-center gap-3 active:opacity-70"
                      onPress={() => addMemberToTower(m.id)}
                    >
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-high">
                        <IconUser size={18} color="#41484F" />
                      </View>
                      <Typography variant="body-large" className="flex-1">
                        {m.name}
                      </Typography>
                      <IconUserPlus size={18} color={primaryColor} />
                    </Pressable>
                    {index < availableMembers.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
              <Spacer size="group" />
            </>
          )}

          {/* Scan QR to add new member */}
          <Button variant="light" fullWidth onPress={openMemberScanner}>
            <View className="flex-row items-center gap-2">
              <IconUserPlus size={20} color={primaryColor} />
              <Typography variant="body-large" bold className="text-primary">
                QR-Code scannen
              </Typography>
            </View>
          </Button>

          <Spacer size="compact" />

          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("tower-members")}
          >
            Schließen
          </Button>
        </View>
      </TrueSheet>

      {/* Stacking TrueSheet: QR Scanner for Tower */}
      <TrueSheet
        name="tower-invite-scanner"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            QR-Code scannen
          </Typography>
          <Spacer size="inline" />
          <Typography variant="body-medium" className="text-on-surface-variant">
            Scanne den QR-Code eines Mitglieds, um es dem Turm hinzuzufügen.
          </Typography>
          <Spacer size="group" />
          <View className="overflow-hidden rounded-xl bg-surface-container-high">
            <CameraView
              style={{ width: "100%", height: 280 }}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => handleScannedCode(data)}
            />
          </View>
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("tower-invite-scanner")}
          >
            Abbrechen
          </Button>
        </View>
      </TrueSheet>
    </>
  );
}
