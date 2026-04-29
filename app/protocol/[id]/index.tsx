import { Redirect, useLocalSearchParams } from "expo-router";

export default function ProtocolIndex() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/protocol/${id}/edit` as any} />;
}