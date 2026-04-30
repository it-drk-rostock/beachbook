import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCSSVariable, withUniwind } from "uniwind";
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
import { useUser } from "@/hooks/use-user";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function DashboardScreen() {
  const router = useRouter();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const { isLoading, member, organization, name } = useUser();

  const hasOrganization = !isLoading && !!member;
  const towers = member?.towerIds ?? [];
  const hasTowers = towers.length > 0;

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-8"
      >
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

        {!isLoading && !hasOrganization && (
          <>
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
          </>
        )}

        {hasOrganization && !hasTowers && (
          <>
            <Spacer size="group" />
            <EmptyStateCard
              tone="surface"
              icon={<IconBuildingLighthouse size={24} color={primaryColor} />}
              title="Keine Türme"
              description="Frag deinen Wachleiter, dich bei einem bestehenden Turm einzuladen."
              onPress={() => router.push("/towers")}
            />
          </>
        )}

        {hasTowers && (
          <>
            <Spacer size="group" />
            {/* Tower cards based on member.towerIds */}
          </>
        )}

        <Spacer size="group" />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
