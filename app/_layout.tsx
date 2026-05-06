import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import "react-native-reanimated";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { IconPlus } from "@tabler/icons-react-native";
import { Providers } from "@/providers/providers";
import { useAuth } from "@clerk/expo";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

const HEADER_BORDER = "#e5e7eb";
const HEADER_ON_SURFACE = "#111827";

function RootLayoutNav() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });

  if (!isLoaded) return null;
  const signedIn = isSignedIn === true;

  const stackHeaderStyle = {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: HEADER_BORDER,
  } as { backgroundColor?: string };

  const stackHeaderDefaults = {
    headerBackButtonDisplayMode: "minimal" as const,
    headerShadowVisible: false,
    headerStyle: stackHeaderStyle,
    headerTintColor: HEADER_ON_SURFACE,
    headerTitleStyle: { color: HEADER_ON_SURFACE },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={stackHeaderDefaults}>
        <Stack.Protected guard={!signedIn}>
          {/* Screens ONLY available when LOGGED OUT */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="protocols"
            options={{
              headerShown: true,
              headerTitle: "Protokolle",
              headerRight: () => (
                <IconPlus
                  onPress={async () => {
                    await TrueSheet.present("create-protocol");
                  }}
                  size={24}
                  color={HEADER_ON_SURFACE}
                />
              ),
              headerSearchBarOptions: {
                onChangeText: (event) => {
                  router.setParams({ q: event.nativeEvent.text });
                },
                placeholder: "Suche...",
              },
            }}
          />
          <Stack.Screen
            name="organization"
            options={{
              headerShown: true,
              headerTitle: "Organisation",
            }}
          />
          <Stack.Screen
            name="protocol/[id]"
            options={{
              headerTitle: "Protokoll Designer",
            }}
          />
          <Stack.Screen
            name="submission/[id]"
            options={{
              headerTitle: "Einreichung",
            }}
          />
          <Stack.Screen
            name="tower/[id]"
            options={{
              headerShown: true,
              headerTitle: "Turm",
            }}
          />
          <Stack.Screen
            name="me"
            options={{
              headerShown: true,
              headerTitle: "Account",
            }}
          />
          <Stack.Screen
            name="towers"
            options={{
              headerShown: true,
              headerTitle: "Türme",
              headerTransparent: true,
              headerRight: () => (
                <IconPlus
                  onPress={async () => {
                    await TrueSheet.present("create-tower");
                  }}
                  size={24}
                  color={HEADER_ON_SURFACE}
                />
              ),
              headerSearchBarOptions: {
                onChangeText: (event) => {
                  router.setParams({ q: event.nativeEvent.text });
                },
                placeholder: "Suche...",
              },
            }}
          />
        </Stack.Protected>

        <Stack.Screen
          name="help"
          options={{ headerShown: false, presentation: "formSheet" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
