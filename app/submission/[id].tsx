import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function SubmissionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Submission</Text>
    </View>
  );
}
