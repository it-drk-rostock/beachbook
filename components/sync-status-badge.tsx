import { useNetInfo } from "@react-native-community/netinfo";
import { Text, View } from "react-native";

export function SyncStatusBadge() {
  const { isConnected } = useNetInfo();
  const isOnline = isConnected === true;

  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-error"}`}
      />
      <Text className="text-xs text-on-surface-variant">
        {isOnline ? "Online" : "Offline"}
      </Text>
    </View>
  );
}
