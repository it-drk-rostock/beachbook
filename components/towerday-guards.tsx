import { useRef, useState } from "react";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { IconPlus, IconX, IconTrash } from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Spacer } from "@/components/spacer";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";

const leaderSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
});

const editGuardSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
});

const addGuardsSchema = z.object({
  guards: z
    .array(z.object({ name: z.string().min(1, "Name ist erforderlich") }))
    .min(1),
});

type LeaderFormData = z.infer<typeof leaderSchema>;
type EditGuardFormData = z.infer<typeof editGuardSchema>;
type AddGuardsFormData = z.infer<typeof addGuardsSchema>;

interface Guard {
  id: string;
  name: string;
  role: "guard" | "guardleader" | "towerleader";
}

interface TowerdayGuardsProps {
  towerdayId: string;
  organizationId: string;
  guards: Guard[];
}

export function TowerdayGuards({
  towerdayId,
  organizationId,
  guards,
}: TowerdayGuardsProps) {
  const db = useDb();

  const guardleader = guards.find((g) => g.role === "guardleader");
  const towerleader = guards.find((g) => g.role === "towerleader");
  const regularGuards = guards.filter((g) => g.role === "guard");

  const [leaderEditRole, setLeaderEditRole] = useState<
    "guardleader" | "towerleader" | null
  >(null);
  const [editingGuardId, setEditingGuardId] = useState<string | null>(null);

  const leaderInputRef = useRef<RNTextInput>(null);
  const editGuardInputRef = useRef<RNTextInput>(null);

  const leaderForm = useForm<LeaderFormData>({
    resolver: zodResolver(leaderSchema),
    defaultValues: { name: "" },
  });

  const editGuardForm = useForm<EditGuardFormData>({
    resolver: zodResolver(editGuardSchema),
    defaultValues: { name: "" },
  });

  const addGuardsForm = useForm<AddGuardsFormData>({
    resolver: zodResolver(addGuardsSchema),
    defaultValues: { guards: [{ name: "" }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: addGuardsForm.control,
    name: "guards",
  });

  const openLeaderEdit = (role: "guardleader" | "towerleader") => {
    const existing = role === "guardleader" ? guardleader : towerleader;
    setLeaderEditRole(role);
    leaderForm.reset({ name: existing?.name ?? "" });
    TrueSheet.present("tower-edit-leader");
  };

  const saveLeader = (data: LeaderFormData) => {
    if (!leaderEditRole) return;
    const existing =
      leaderEditRole === "guardleader" ? guardleader : towerleader;
    if (existing) {
      db.update(app.guards, existing.id, { name: data.name.trim() });
    } else {
      db.insert(app.guards, {
        towerdayId,
        organizationId,
        role: leaderEditRole,
        name: data.name.trim(),
      });
    }
    TrueSheet.dismiss("tower-edit-leader");
  };

  const openGuardEdit = (guard: Guard) => {
    setEditingGuardId(guard.id);
    editGuardForm.reset({ name: guard.name });
    TrueSheet.present("tower-edit-guard");
  };

  const saveGuardEdit = (data: EditGuardFormData) => {
    if (!editingGuardId) return;
    db.update(app.guards, editingGuardId, { name: data.name.trim() });
    TrueSheet.dismiss("tower-edit-guard");
  };

  const deleteGuard = () => {
    if (!editingGuardId) return;
    db.delete(app.guards, editingGuardId);
    TrueSheet.dismiss("tower-edit-guard");
  };

  const openAddGuards = () => {
    addGuardsForm.reset({ guards: [{ name: "" }] });
    TrueSheet.present("tower-add-guard");
  };

  const saveAllGuards = (data: AddGuardsFormData) => {
    const names = data.guards
      .map((g) => g.name.trim())
      .filter((n) => n.length > 0);
    for (const name of names) {
      db.insert(app.guards, {
        towerdayId,
        organizationId,
        role: "guard",
        name,
      });
    }
    addGuardsForm.reset({ guards: [{ name: "" }] });
    TrueSheet.dismiss("tower-add-guard");
  };

  return (
    <>
      <SectionHeader>Leiter</SectionHeader>

      <Spacer size="item" />

      <Typography
        variant="label-small"
        bold
        className="text-on-surface-variant uppercase mb-1"
      >
        Wachleiter
      </Typography>
      <Pressable
        className="border border-outline-variant bg-surface rounded-md px-5 py-3.5"
        onPress={() => openLeaderEdit("guardleader")}
      >
        <Typography
          variant="body-large"
          bold={!!guardleader}
          className={
            guardleader ? "text-on-surface" : "text-muted-foreground"
          }
        >
          {guardleader?.name ?? "Wachleiter eingeben"}
        </Typography>
      </Pressable>

      <Spacer size="item" />

      <Typography
        variant="label-small"
        bold
        className="text-on-surface-variant uppercase mb-1"
      >
        Turmleiter
      </Typography>
      <Pressable
        className="border border-outline-variant bg-surface rounded-md px-5 py-3.5"
        onPress={() => openLeaderEdit("towerleader")}
      >
        <Typography
          variant="body-large"
          bold={!!towerleader}
          className={
            towerleader ? "text-on-surface" : "text-muted-foreground"
          }
        >
          {towerleader?.name ?? "Turmleiter eingeben"}
        </Typography>
      </Pressable>

      <Spacer size="group" />

      <SectionHeader>Wachgänger</SectionHeader>

      <Spacer size="item" />

      {regularGuards.length > 0 ? (
        <>
          <View className="rounded-2xl bg-surface-container overflow-hidden">
            {regularGuards.map((guard, index) => (
              <View key={guard.id}>
                <Pressable
                  className="p-4 active:opacity-70"
                  onPress={() => openGuardEdit(guard)}
                >
                  <Typography variant="body-large" bold>
                    {guard.name}
                  </Typography>
                </Pressable>
                {index < regularGuards.length - 1 && <Divider />}
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
              Keine Wachgänger vorhanden
            </Typography>
          </View>
          <Spacer size="item" />
        </>
      )}

      <Button variant="light" fullWidth onPress={openAddGuards}>
        <View className="flex-row items-center gap-2">
          <IconPlus size={18} color="#008CCD" />
          <Typography variant="body-large" bold className="text-primary">
            Wachgänger hinzufügen
          </Typography>
        </View>
      </Button>

      {/* Leader Edit Sheet */}
      <TrueSheet
        name="tower-edit-leader"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
        onDidPresent={() => leaderInputRef.current?.focus()}
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              {leaderEditRole === "guardleader"
                ? "Wachleiter bearbeiten"
                : "Turmleiter bearbeiten"}
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("tower-edit-leader")}
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
            Name
          </Typography>
          <Controller
            control={leaderForm.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={leaderInputRef}
                placeholder="Name eingeben"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!leaderForm.formState.errors.name}
              />
            )}
          />
          {leaderForm.formState.errors.name && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {leaderForm.formState.errors.name.message}
            </Typography>
          )}
          <Spacer size="group" />
          <Button fullWidth onPress={leaderForm.handleSubmit(saveLeader)}>
            Speichern
          </Button>
        </View>
      </TrueSheet>

      {/* Add Guards Sheet */}
      <TrueSheet
        name="tower-add-guard"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              Wachgänger hinzufügen
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("tower-add-guard")}
            >
              <IconX size={16} color="#41484F" />
            </Pressable>
          </View>
          <Spacer size="group" />
          {fields.map((field, index) => (
            <View key={field.id}>
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Controller
                    control={addGuardsForm.control}
                    name={`guards.${index}.name`}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        placeholder="Name eingeben"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!error}
                      />
                    )}
                  />
                </View>
                {fields.length > 1 && (
                  <Pressable
                    className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                    onPress={() => remove(index)}
                  >
                    <IconX size={18} color="#BA1A1A" />
                  </Pressable>
                )}
              </View>
              <Spacer size="compact" />
            </View>
          ))}
          <Spacer size="inline" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => append({ name: "" })}
          >
            <View className="flex-row items-center gap-2">
              <IconPlus size={16} color="#008CCD" />
              <Typography variant="label-large" className="text-primary">
                Weiteren hinzufügen
              </Typography>
            </View>
          </Button>
          <Spacer size="group" />
          <Button
            fullWidth
            onPress={addGuardsForm.handleSubmit(saveAllGuards)}
          >
            {fields.length > 1
              ? `${fields.length} Wachgänger speichern`
              : "Speichern"}
          </Button>
        </View>
      </TrueSheet>

      {/* Edit Guard Sheet */}
      <TrueSheet
        name="tower-edit-guard"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
        onDidPresent={() => editGuardInputRef.current?.focus()}
      >
        <View style={{ padding: 24, paddingTop: 8 }}>
          <View className="flex-row items-center justify-between">
            <Typography variant="title-large" bold>
              Wachgänger bearbeiten
            </Typography>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container active:opacity-70"
              onPress={() => TrueSheet.dismiss("tower-edit-guard")}
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
            Name
          </Typography>
          <Controller
            control={editGuardForm.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={editGuardInputRef}
                placeholder="Name eingeben"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!editGuardForm.formState.errors.name}
              />
            )}
          />
          {editGuardForm.formState.errors.name && (
            <Typography variant="body-small" className="text-error mt-1 ml-1">
              {editGuardForm.formState.errors.name.message}
            </Typography>
          )}
          <Spacer size="group" />
          <Button
            fullWidth
            onPress={editGuardForm.handleSubmit(saveGuardEdit)}
          >
            Speichern
          </Button>
          <Spacer size="compact" />
          <Button variant="danger-light" fullWidth onPress={deleteGuard}>
            <View className="flex-row items-center gap-2">
              <IconTrash size={18} color="#BA1A1A" />
              <Typography variant="label-large" bold className="text-error">
                Löschen
              </Typography>
            </View>
          </Button>
        </View>
      </TrueSheet>
    </>
  );
}
