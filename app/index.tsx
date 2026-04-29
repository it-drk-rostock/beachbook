import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { withUniwind } from "uniwind";
import { IconLock, IconMail } from "@tabler/icons-react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { TextInput } from "@/components/text-input";
import { Typography } from "@/components/typography";

const StyledSafeAreaView = withUniwind(SafeAreaView);
const loginSchema = z.object({
  email: z.string().min(1, "E-Mail ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Login form submitted", values);
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          <BrandHeader />

          <Spacer size="section" />

          <Typography variant="headline-medium" bold>
            Willkommen zurück
          </Typography>

          <Spacer size="content" />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                leftIcon={<IconMail size={20} color="#727980" />}
                placeholder="E-Mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                error={Boolean(errors.email)}
              />
            )}
          />

          {errors.email?.message ? (
            <>
              <Spacer size="inline" />
              <Typography variant="body-small" className="text-error">
                {errors.email.message}
              </Typography>
            </>
          ) : null}

          <Spacer size="item" />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                leftIcon={<IconLock size={20} color="#727980" />}
                placeholder="Passwort"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                textContentType="password"
                returnKeyType="done"
                error={Boolean(errors.password)}
              />
            )}
          />

          {errors.password?.message ? (
            <>
              <Spacer size="inline" />
              <Typography variant="body-small" className="text-error">
                {errors.password.message}
              </Typography>
            </>
          ) : null}

          <Spacer size="group" />

          <Button fullWidth onPress={handleSubmit(onSubmit)}>
            Anmelden
          </Button>

          <Spacer size="compact" />

          <Button
            variant="outline"
            fullWidth
            onPress={() => router.push("/help")}
          >
            Hilfe
          </Button>
        </View>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
