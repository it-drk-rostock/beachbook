import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function TowerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Tower Detail</Text>
    </View>
  );
}
