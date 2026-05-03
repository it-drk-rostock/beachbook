import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAll, useDb } from "jazz-tools/react-native";
import { app } from "@/schema";
import SurveyCreatorDom from "@/components/survey-creator-dom";

export default function ProtocolEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();

  const protocols = useAll(id ? app.protocols.where({ id }) : undefined);
  const protocol = protocols?.[0];

  const handleSave = async (json: object) => {
    if (!protocol) return;
    db.update(app.protocols, protocol.id, {
      schema: json as any,
    });
  };

  if (!protocol) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#008CCD" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SurveyCreatorDom
        json={(protocol.schema as object) ?? {}}
        onSave={handleSave}
        dom={{ style: { flex: 1 } }}
      />
    </View>
  );
}
