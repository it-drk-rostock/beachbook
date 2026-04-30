import { JazzProvider } from "jazz-tools/react-native";
import React from "react";
import { useLocalFirstAuth } from "jazz-tools/expo";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const { secret, isLoading } = useLocalFirstAuth();
  if (isLoading || !secret) return null;
  return (
    <JazzProvider
      config={{
        appId: process.env.EXPO_PUBLIC_JAZZ_APP_ID!,
        serverUrl: process.env.EXPO_PUBLIC_JAZZ_SERVER_URL!,
        secret,
      }}
    >
      {children}
    </JazzProvider>
  );
};
