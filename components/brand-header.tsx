import { IconBeach, IconBook } from "@tabler/icons-react-native";
import { Text, View } from "react-native";

export function BrandHeader() {
  return (
    <View className="flex-row items-center gap-3">
      {/* Vertical Icon Stack */}
      <View className="items-center justify-center">
        <IconBeach size={24} color="#008ccd" />
        <View className="h-0.5" /> {/* Small spacing between icons */}
        <IconBook size={24} color="#002d55" />
      </View>

      <Text
        className={`font-bold text-on-surface ${"text-2xl tracking-tighter"}`}
      >
        BeachBook
      </Text>
    </View>
  );
}
