import { useEffect } from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb, useSession } from "jazz-tools/react-native";
import { Typography } from "@/components/typography";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { app } from "@/schema";

const organizationSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organization?: { id: string; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OrganizationForm({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const db = useDb();
  const session = useSession();
  const isEditing = !!organization;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name ?? "",
    },
  });

  useEffect(() => {
    reset({ name: organization?.name ?? "" });
  }, [organization?.name, reset]);

  const onSubmit = async (data: OrganizationFormData) => {
    if (isEditing && organization) {
      db.update(app.organizations, organization.id, { name: data.name });
    } else {
      const org = await db
        .insert(app.organizations, { name: data.name })
        .wait({ tier: "local" });

      if (session) {
        db.insert(app.members, {
          name: "Admin",
          organizationId: org.id,
          user_id: session.user_id,
          role: "admin",
        });
      }
    }

    onSuccess?.();
  };

  return (
    <View style={{ padding: 24, paddingTop: 8 }}>
      <Spacer size="item" />
      <Typography variant="title-large" bold>
        {isEditing ? "Organisation bearbeiten" : "Organisation erstellen"}
      </Typography>

      <Spacer size="group" />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Name der Organisation"
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

      <Button variant="subtle" fullWidth onPress={onCancel}>
        Abbrechen
      </Button>
    </View>
  );
}
