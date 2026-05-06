import { IconBeach, IconBook } from "@tabler/icons-react-native";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function BrandHeader() {
  const textOnSurfaceColor = useCSSVariable("--color-on-surface") as string;
  const primaryColor = useCSSVariable("--color-primary") as string;

  return (
    <View className="flex-row items-center gap-3">
      <View className="items-center justify-center">
        <IconBeach size={24} color={primaryColor} />
        <View className="h-0.5" />
        <IconBook size={24} color={textOnSurfaceColor} />
      </View>

      <Text className="text-2xl font-bold tracking-tighter text-on-surface">
        BeachBook
      </Text>
    </View>
  );
}
