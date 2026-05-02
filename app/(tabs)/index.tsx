import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCSSVariable, withUniwind } from "uniwind";
import { useAll } from "jazz-tools/react-native";
import { FlashList } from "@shopify/flash-list";
import {
  IconBuildingCommunity,
  IconBuildingLighthouse,
} from "@tabler/icons-react-native";
import { BrandHeader } from "@/components/brand-header";
import { Avatar } from "@/components/avatar";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { PageHeader } from "@/components/page-header";
import { Spacer } from "@/components/spacer";
import { EmptyStateCard } from "@/components/empty-state-card";
import { TowerCard } from "@/components/tower-card";
import { useUser } from "@/hooks/use-user";
import { app } from "@/schema";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function DashboardScreen() {
  const router = useRouter();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const { isLoading, member, organization, name } = useUser();

  const hasOrganization = !isLoading && !!member;
  const towerIds = member?.towerIds ?? [];
  const hasTowers = towerIds.length > 0;

  const towers = useAll(
    hasOrganization && organization
      ? app.towers.where({ organizationId: organization.id }).include({
          location: true,
        })
      : undefined,
  );

  const myTowers = towers?.filter((t) => towerIds.includes(t.id)) ?? [];

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between">
            <BrandHeader />
            <Avatar
              image={{ uri: "", name }}
              size={40}
              backgroundColor={primaryColor}
              showBorder={false}
              onPress={() => router.push("/me")}
            />
          </View>

          <Spacer size="inline" />
          <SyncStatusBadge />

          <Spacer size="group" />
          <PageHeader>Dashboard</PageHeader>
        </View>

        {!isLoading && !hasOrganization && (
          <View className="px-6">
            <Spacer size="group" />
            <EmptyStateCard
              tone="primary"
              icon={<IconBuildingCommunity size={24} color={primaryColor} />}
              title="Keine Organisation"
              description="Frage deinen Wachleiter oder erstelle deine eigene Organisation."
              onPress={() => router.push("/organization")}
            />

            <Spacer size="compact" />
            <EmptyStateCard
              tone="surface"
              icon={<IconBuildingLighthouse size={24} color={primaryColor} />}
              title="Keine Türme"
              description="Um Türme zu sehen, brauchst du eine Organisation."
              onPress={() => router.push("/towers")}
            />
          </View>
        )}

        {hasOrganization && !hasTowers && (
          <View className="px-6">
            <Spacer size="group" />
            <EmptyStateCard
              tone="surface"
              icon={<IconBuildingLighthouse size={24} color={primaryColor} />}
              title="Keine Türme"
              description="Frag deinen Wachleiter, dich bei einem bestehenden Turm einzuladen."
              onPress={() => router.push("/towers")}
            />
          </View>
        )}

        {hasTowers && (
          <View className="flex-1 mt-4">
            <FlashList
              data={myTowers}
              keyExtractor={(item) => item.id}
              contentContainerClassName="px-6 pb-8"
              ItemSeparatorComponent={() => <Spacer size="compact" />}
              renderItem={({ item }) => (
                <TowerCard
                  name={item.name}
                  number={item.number}
                  locationName={item.location?.name}
                  main={item.main}
                  status={item.status}
                  showMemberCount={false}
                  onPress={() => router.push(`/tower/${item.id}` as any)}
                />
              )}
            />
          </View>
        )}
      </View>
    </StyledSafeAreaView>
  );
}
