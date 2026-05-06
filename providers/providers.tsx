import React from "react";
import { JazzProvider } from "jazz-tools/react-native";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { resourceCache } from "@clerk/expo/resource-cache";
import { deDE } from "@clerk/localizations";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function JazzClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth({
    treatPendingAsSignedOut: false,
  });

  const [jwtToken, setJwtToken] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;

    const loadToken = async () => {
      if (!isLoaded || !isSignedIn) {
        if (!cancelled) {
          setJwtToken(undefined);
        }
        return;
      }

      try {
        const token = await getToken({ template: "clerk" });
        if (!cancelled) setJwtToken(token ?? undefined);
      } catch {
        if (!cancelled) setJwtToken(undefined);
      }
    };

    loadToken();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

  if (!isLoaded) return null;
  // Keep Jazz mounted even without token to avoid render deadlocks.
  // Jazz can run unauthenticated until a JWT becomes available.
  return (
    <JazzProvider
      config={{
        appId: process.env.EXPO_PUBLIC_JAZZ_APP_ID!,
        serverUrl: process.env.EXPO_PUBLIC_JAZZ_SERVER_URL!,
        jwtToken: isSignedIn ? jwtToken : undefined,
        env: "prod",
      }}
    >
      {children}
    </JazzProvider>
  );
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      localization={deDE}
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
    >
      <JazzClerkBridge>{children}</JazzClerkBridge>
    </ClerkProvider>
  );
};
