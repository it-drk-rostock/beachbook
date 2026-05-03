import { useMemo } from "react";
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

  const { todayStart, tomorrowStart } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { todayStart: start.getTime(), tomorrowStart: end.getTime() };
  }, []);

  const now = useMemo(() => Date.now(), []);

  const towers = useAll(
    hasOrganization && organization
      ? app.towers.where({ organizationId: organization.id }).include({
          location: true,
        })
      : undefined,
  );

  const towerdays = useAll(
    hasOrganization && organization
      ? app.towerdays
          .where({
            organizationId: organization.id,
            date: { gte: todayStart, lt: tomorrowStart },
          })
          .include({
            guardsViaTowerday: true,
            shiftsViaTowerday: true,
          })
      : undefined,
  );

  const myTowers = towers?.filter((t) => towerIds.includes(t.id)) ?? [];

  const towerdayMap = useMemo(() => {
    const map = new Map<
      string,
      {
        status: "open" | "completed";
        dutyNames: string[];
        preparedNames: string[];
      }
    >();
    if (!towerdays) return map;

    const current = new Date(now);
    const mins = current.getMinutes();
    current.setMinutes(mins < 30 ? 0 : 30, 0, 0);
    const windowStart = current.getTime();
    const windowEnd = windowStart + 30 * 60 * 1000;

    for (const td of towerdays) {
      const guards = td.guardsViaTowerday ?? [];
      const shifts = td.shiftsViaTowerday ?? [];
      const nameMap = new Map(guards.map((g) => [g.id, g.name]));

      const overlapping = shifts.filter((s) => {
        const start =
          typeof s.start === "number" ? s.start : new Date(s.start).getTime();
        const end =
          typeof s.end === "number" ? s.end : new Date(s.end).getTime();
        return start < windowEnd && end > windowStart;
      });

      map.set(td.towerId, {
        status: td.isCompleted ? "completed" : "open",
        dutyNames: overlapping
          .filter((s) => s.type === "duty")
          .map((s) => nameMap.get(s.guardId) ?? "–"),
        preparedNames: overlapping
          .filter((s) => s.type === "prepared")
          .map((s) => nameMap.get(s.guardId) ?? "–"),
      });
    }
    return map;
  }, [towerdays, now]);

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
              renderItem={({ item }) => {
                const td = towerdayMap.get(item.id);
                return (
                  <TowerCard
                    name={item.name}
                    number={item.number}
                    locationName={item.location?.name}
                    main={item.main}
                    status={item.status}
                    showMemberCount={false}
                    towerdayStatus={td ? td.status : "none"}
                    dutyNames={td?.dutyNames}
                    preparedNames={td?.preparedNames}
                    onPress={() => router.push(`/tower/${item.id}` as any)}
                  />
                );
              }}
            />
          </View>
        )}
      </View>
    </StyledSafeAreaView>
  );
}
