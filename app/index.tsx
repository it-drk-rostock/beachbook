import { useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { withUniwind } from "uniwind";
import { useAuth, useSignIn } from "@clerk/expo";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { Typography } from "@/components/typography";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function LoginScreen() {
  const { isSignedIn, isLoaded, signOut } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { signIn } = useSignIn();
  const router = useRouter();
  

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannerLocked, setScannerLocked] = useState(false);

  if (!isLoaded) return null;

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert("Kamera benötigt", "Bitte erlaube den Kamera-Zugriff.");
        return;
      }
    }
    setScannerLocked(false);
    setScanning(true);
  };

  const handleScanned = async (data: string) => {
    if (scannerLocked || !signIn) return;
    setScannerLocked(true);

    const ticket = data.trim();
    if (!ticket) {
      setScannerLocked(false);
      Alert.alert("Ungültiger QR-Code", "Kein Token gefunden.");
      return;
    }

    try {
      const { error } = await signIn.ticket({ ticket });

      if (error) {
        Alert.alert("Anmeldung fehlgeschlagen", error.message ?? "Unbekannter Fehler");
        setScannerLocked(false);
        setScanning(false);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: () => router.replace("/"),
        });
      }
    } catch (err: any) {
      Alert.alert(
        "Anmeldung fehlgeschlagen",
        err?.errors?.[0]?.message ?? "Unbekannter Fehler",
      );
      setScannerLocked(false);
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
        ) : scanning ? (
          <>
            <Typography
              variant="body-medium"
              className="text-on-surface-variant"
            >
              Scanne den QR-Code deiner Einladung.
            </Typography>
            <Spacer size="item" />
            <View className="overflow-hidden rounded-xl bg-badge">
              <CameraView
                style={{ width: "100%", height: 280 }}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => handleScanned(data)}
              />
            </View>
            <Spacer size="item" />
            <Button
              variant="secondary"
              fullWidth
              onPress={() => setScanning(false)}
            >
              Abbrechen
            </Button>
          </>
        ) : (
          <Button fullWidth onPress={openScanner}>
            Mit QR-Code anmelden
          </Button>
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
    </StyledSafeAreaView>
  );
}
