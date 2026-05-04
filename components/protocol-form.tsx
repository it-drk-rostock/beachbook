import { useEffect, useRef } from "react";
import { Pressable, TextInput as RNTextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import {
  IconChevronRight,
  IconTrash,
  IconX,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/button";

const protocolSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
});

type ProtocolFormData = z.infer<typeof protocolSchema>;

export interface ProtocolData {
  id: string;
  name: string;
  description: string | null;
}

interface ProtocolFormProps {
  organizationId: string;
  protocol?: ProtocolData | null;
  onDismiss: () => void;
  onSaved?: (data: ProtocolData) => void;
  onDeleted?: () => void;
  onOpenDesigner?: (id: string) => void;
}

export function ProtocolForm({
  organizationId,
  protocol,
  onDismiss,
  onSaved,
  onDeleted,
  onOpenDesigner,
}: ProtocolFormProps) {
  const db = useDb();
  const isEditing = !!protocol;

  const form = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      name: protocol?.name ?? "",
      description: protocol?.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: protocol?.name ?? "",
      description: protocol?.description ?? "",
    });
  }, [protocol?.id]);

  const handleSave = (data: ProtocolFormData) => {
    const name = data.name.trim();
    const description = data.description?.trim() || null;

    if (isEditing && protocol) {
      db.update(app.protocols, protocol.id, { name, description });
      onSaved?.({ id: protocol.id, name, description });
    } else {
      const created = db.insert(app.protocols, {
        name,
        description,
        organizationId,
        schema: {},
      });
      onSaved?.({ id: created.id, name, description });
    }
  };

  const handleDelete = () => {
    if (!protocol) return;
    db.delete(app.protocols, protocol.id);
    onDeleted?.();
  };

  return (
    <View className="px-6 pb-10 pt-2">
      <View className="flex-row items-center justify-between">
        <Typography variant="title-large" bold>
          {isEditing ? "Protokoll bearbeiten" : "Protokoll erstellen"}
        </Typography>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-badge active:opacity-70"
          onPress={onDismiss}
        >
          <IconX size={16} color="#41484F" />
        </Pressable>
      </View>

      <Spacer size="group" />

      <Typography
        variant="label-small"
        bold
        className="mb-1 uppercase text-on-surface-variant"
      >
        Name
      </Typography>
      <Controller
        control={form.control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Protokollname"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!form.formState.errors.name}
          />
        )}
      />
      {form.formState.errors.name && (
        <Typography variant="body-small" className="ml-1 mt-1 text-error">
          {form.formState.errors.name.message}
        </Typography>
      )}

      <Spacer size="item" />

      <Typography
        variant="label-small"
        bold
        className="mb-1 uppercase text-on-surface-variant"
      >
        Beschreibung
      </Typography>
      <Controller
        control={form.control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Optionale Beschreibung"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Spacer size="group" />

      <Button fullWidth onPress={form.handleSubmit(handleSave)}>
        {isEditing ? "Speichern" : "Erstellen"}
      </Button>

      {isEditing && protocol && (
        <>
          <Spacer size="compact" />
          <Button
            variant="light"
            fullWidth
            onPress={() => onOpenDesigner?.(protocol.id)}
          >
            <View className="flex-row items-center gap-2">
              <Typography variant="label-large" bold className="text-primary">
                Protokoll Designer
              </Typography>
              <IconChevronRight size={18} color="#008CCD" />
            </View>
          </Button>
          <Spacer size="compact" />
          <Pressable
            onPress={handleDelete}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-error/10 px-6 py-4 active:opacity-80"
          >
            <IconTrash size={18} color="#BA1A1A" />
            <Typography variant="label-large" bold className="text-error">
              Löschen
            </Typography>
          </Pressable>
        </>
      )}
    </View>
  );
}
