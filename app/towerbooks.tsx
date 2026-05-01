import { View } from "react-native";
import { Typography } from "@/components/typography";

export default function TowerbooksScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Typography variant="title-large" bold>
        Turmbücher
      </Typography>
    </View>
  );
}
