import { useRef, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { withUniwind } from "uniwind";
import { useAuth, useSignIn } from "@clerk/expo";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLock, IconMail, IconX } from "@tabler/icons-react-native";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { TextInput } from "@/components/text-input";
import { Typography } from "@/components/typography";

const StyledSafeAreaView = withUniwind(SafeAreaView);

const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === "true";

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { isSignedIn, isLoaded, signOut } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { signIn } = useSignIn();
  const router = useRouter();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const scannerLocked = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!isLoaded) return null;

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert("Kamera benötigt", "Bitte erlaube den Kamera-Zugriff.");
        return;
      }
    }
    scannerLocked.current = false;
    setScanning(true);
  };

  const closeScanner = () => {
    scannerLocked.current = false;
    setScanning(false);
  };

  const handleDevLogin = async ({ email, password }: LoginFormValues) => {
    if (!signIn) return;

    try {
      const { error: pwError } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (pwError) {
        Alert.alert(
          "Anmeldung fehlgeschlagen",
          pwError.message ?? "Unbekannter Fehler",
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: async () => {} });
      } else {
        Alert.alert(
          "Anmeldung fehlgeschlagen",
          `Unerwarteter Status: ${signIn.status}`,
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Anmeldung fehlgeschlagen",
        err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          err?.message ??
          "Unbekannter Fehler",
      );
    }
  };

  const handleScanned = async (data: string) => {
    if (scannerLocked.current || !signIn) return;
    scannerLocked.current = true;

    let credentials: { email: string; password: string };
    try {
      credentials = JSON.parse(data.trim());
    } catch {
      scannerLocked.current = false;
      Alert.alert("Ungültiger QR-Code", "Der QR-Code hat ein ungültiges Format.");
      return;
    }

    if (!credentials.email || !credentials.password) {
      scannerLocked.current = false;
      Alert.alert("Ungültiger QR-Code", "E-Mail oder Passwort fehlt.");
      return;
    }

    try {
      const { error: pwError } = await signIn.password({
        emailAddress: credentials.email,
        password: credentials.password,
      });

      if (pwError) {
        Alert.alert(
          "Anmeldung fehlgeschlagen",
          pwError.message ?? "Unbekannter Fehler",
        );
        scannerLocked.current = false;
        setScanning(false);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: async () => {
            setScanning(false);
          },
        });
      } else {
        Alert.alert(
          "Anmeldung fehlgeschlagen",
          `Unerwarteter Status: ${signIn.status}`,
        );
        scannerLocked.current = false;
        setScanning(false);
      }
    } catch (err: any) {
      Alert.alert(
        "Anmeldung fehlgeschlagen",
        err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          err?.message ??
          "Unbekannter Fehler",
      );
      scannerLocked.current = false;
      setScanning(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <BrandHeader />

        <Spacer size="section" />

        <Typography variant="headline-medium" bold>
          Willkommen zurück
        </Typography>

        <Spacer size="content" />

        {isSignedIn ? (
          <>
            <Typography variant="body-medium" bold>
              Du bist eingeloggt.
            </Typography>
            <Spacer size="item" />
            <Button fullWidth onPress={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <>
            {DEV_MODE && (
              <>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="E-Mail"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      error={!!errors.email}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      leftIcon={<IconMail size={20} color="#6b7280" />}
                    />
                  )}
                />
                {errors.email && (
                  <>
                    <Spacer size="inline" />
                    <Typography
                      variant="body-small"
                      style={{ color: "#dc2626" }}
                    >
                      {errors.email.message}
                    </Typography>
                  </>
                )}

                <Spacer size="item" />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Passwort"
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      secureTextEntry
                      returnKeyType="done"
                      error={!!errors.password}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      leftIcon={<IconLock size={20} color="#6b7280" />}
                    />
                  )}
                />
                {errors.password && (
                  <>
                    <Spacer size="inline" />
                    <Typography
                      variant="body-small"
                      style={{ color: "#dc2626" }}
                    >
                      {errors.password.message}
                    </Typography>
                  </>
                )}

                <Spacer size="item" />

                <Button
                  fullWidth
                  disabled={isSubmitting}
                  onPress={handleSubmit(handleDevLogin)}
                >
                  {isSubmitting ? "Anmelden…" : "Anmelden"}
                </Button>

                <Spacer size="group" />

                <View className="flex-row items-center gap-3">
                  <View className="flex-1 h-px bg-outline-variant" />
                  <Typography
                    variant="body-small"
                    style={{ color: "#6b7280" }}
                  >
                    oder
                  </Typography>
                  <View className="flex-1 h-px bg-outline-variant" />
                </View>

                <Spacer size="group" />
              </>
            )}

            <Button fullWidth onPress={openScanner}>
              Mit QR-Code anmelden
            </Button>
          </>
        )}

        <Spacer size="group" />

        <Button
          variant="outline"
          fullWidth
          onPress={() => router.push("/help")}
        >
          Hilfe
        </Button>
      </View>

      <Modal
        visible={scanning}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            facing="back"
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => handleScanned(data)}
          />

          <SafeAreaView style={styles.overlay} pointerEvents="box-none">
            <View style={styles.topBar}>
              <Pressable onPress={closeScanner} style={styles.closeButton}>
                <IconX size={28} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.finderContainer} pointerEvents="none">
              <View style={styles.finder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Typography variant="body-medium" style={styles.hint}>
                QR-Code in den Rahmen halten
              </Typography>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </StyledSafeAreaView>
  );
}

const FINDER_SIZE = 260;
const CORNER_SIZE = 32;
const CORNER_BORDER = 4;

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  finderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  finder: {
    width: FINDER_SIZE,
    height: FINDER_SIZE,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#fff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderBottomRightRadius: 12,
  },
  hint: {
    color: "#fff",
    textAlign: "center",
    marginTop: 24,
  },
});
