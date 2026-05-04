import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDb } from "jazz-tools/react-native";
import { Typography } from "@/components/typography";
import { NumericText } from "@/components/numeric-text";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { app } from "@/schema";

const roleOptions = [
  { value: "guardleader", label: "Wachleiter" },
  { value: "towerleader", label: "Turmleiter" },
  { value: "admin", label: "Admin" },
] as const;

const inviteSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  role: z.enum(["guardleader", "towerleader", "admin"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface MemberInviteFormProps {
  organizationId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MemberInviteForm({
  organizationId,
  userId,
  onSuccess,
  onCancel,
}: MemberInviteFormProps) {
  const db = useDb();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      role: "guardleader",
    },
  });

  useEffect(() => {
    reset({ name: "", role: "guardleader" });
  }, [userId, reset]);

  const onSubmit = (data: InviteFormData) => {
    db.insert(app.members, {
      name: data.name,
      role: data.role,
      user_id: userId,
      organizationId,
    });
    onSuccess?.();
  };

  return (
    <View style={{ padding: 24, paddingTop: 8 }}>
      <Spacer size="item" />
      <Typography variant="title-large" bold>
        Mitglied einladen
      </Typography>

      <Spacer size="item" />
      <View className="flex-row flex-wrap items-baseline gap-1">
        <Typography variant="body-small" className="text-on-surface-variant">
          User ID:
        </Typography>
        <NumericText className="text-sm text-on-surface-variant">{userId}</NumericText>
      </View>

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
        name="role"
        render={({ field: { value, onChange } }) => (
          <View className="flex-row gap-2">
            {roleOptions.map((option) => {
              const active = value === option.value;
              return (
                <Pressable
                  key={option.value}
                  className={`px-4 py-2 rounded-full border ${active ? "bg-primary border-primary" : "bg-surface border-outline-variant"}`}
                  onPress={() => onChange(option.value)}
                >
                  <Typography
                    variant="label-large"
                    className={active ? "text-on-primary" : "text-on-surface"}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        )}
      />

      <Spacer size="group" />

      <Button
        fullWidth
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        Einladen
      </Button>

      <Spacer size="compact" />

      <Button variant="subtle" fullWidth onPress={onCancel}>
        Abbrechen
      </Button>
    </View>
  );
}
