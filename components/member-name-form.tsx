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

const nameSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
});

type NameFormData = z.infer<typeof nameSchema>;

interface MemberNameFormProps {
  memberId: string;
  currentName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MemberNameForm({
  memberId,
  currentName,
  onSuccess,
  onCancel,
}: MemberNameFormProps) {
  const db = useDb();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: currentName },
  });

  const onSubmit = async (data: NameFormData) => {
    db.update(app.members, memberId, { name: data.name });
    onSuccess?.();
  };

  return (
    <View style={{ padding: 24, paddingTop: 8 }}>
      <Spacer size="item" />
      <Typography variant="title-large" bold>
        Name ändern
      </Typography>

      <Spacer size="group" />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Dein Name"
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
        Speichern
      </Button>

      <Spacer size="compact" />

      <Button variant="subtle" fullWidth onPress={onCancel}>
        Abbrechen
      </Button>
    </View>
  );
}
