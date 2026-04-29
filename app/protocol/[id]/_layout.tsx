import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function ProtocolLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          headerTitle: "Protokoll bearbeiten",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
