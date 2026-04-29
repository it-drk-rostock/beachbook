import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function ProtocolEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View>
      <Text>Protocol Edit {id}</Text>
    </View>
  );
}
