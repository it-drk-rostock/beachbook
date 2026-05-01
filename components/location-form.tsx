import { useEffect } from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { app } from "@/schema";

const locationSchema = z.object({
  name: z.string().min(1, "Standortname ist erforderlich"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  organizationId: string;
  location?: { id: string; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function LocationForm({
  organizationId,
  location,
  onSuccess,
  onCancel,
  onDelete,
}: LocationFormProps) {
  const db = useDb();
  const isEditing = !!location;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name ?? "",
    },
  });

  useEffect(() => {
    reset({ name: location?.name ?? "" });
  }, [location?.name, reset]);

  const onSubmit = (data: LocationFormData) => {
    if (isEditing && location) {
      db.update(app.locations, location.id, { name: data.name });
    } else {
      db.insert(app.locations, {
        name: data.name,
        organizationId,
      });
    }

    onSuccess?.();
  };

  return (
    <View style={{ padding: 24, paddingTop: 8 }}>
      <Spacer size="item" />
      <Typography variant="title-large" bold>
        {isEditing ? "Standort bearbeiten" : "Standort erstellen"}
      </Typography>

      <Spacer size="group" />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Name des Standorts"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.name}
            autoFocus={false}
          />
        )}
      />
      {errors.name && (
        <Typography variant="body-small" className="text-error mt-1 ml-1">
          {errors.name.message}
        </Typography>
      )}

      <Spacer size="group" />

      <Button
        fullWidth
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isEditing ? "Speichern" : "Erstellen"}
      </Button>

      <Spacer size="compact" />

      {isEditing && onDelete && (
        <>
          <Button variant="danger-light" fullWidth onPress={onDelete}>
            Standort löschen
          </Button>
          <Spacer size="compact" />
        </>
      )}

      <Button variant="subtle" fullWidth onPress={onCancel}>
        Abbrechen
      </Button>
    </View>
  );
}
