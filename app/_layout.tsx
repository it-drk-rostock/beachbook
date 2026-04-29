import "jazz-tools/expo/polyfills";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { JazzProvider, useSession } from "jazz-tools/react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { IconPlus } from "@tabler/icons-react-native";
import { Providers } from "@/providers/providers";

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

function RootLayoutNav() {
  const session = useSession();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Protected guard={!session?.user_id}>
          {/* Screens ONLY available when LOGGED OUT */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={session?.user_id}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="protocols"
            options={{
              headerShown: true,
              headerTitle: "Protokolle",
              headerShadowVisible: false,
              headerRight: () => (
                <IconPlus
                  onPress={async () => {
                    await TrueSheet.present("create-protocol");
                  }}
                  size={24}
                  color="#1a1c1e"
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
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="protocol/[id]"
            options={{
              headerShown: true,
              headerTitle: "Organisation",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="submission/[id]"
            options={{
              headerShown: true,
              headerTitle: "Organisation",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="tower/[id]"
            options={{
              headerShown: true,
              headerTitle: "Turm",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen name="me" options={{ headerShown: false }} />
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
                  color="#1a1c1e"
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
