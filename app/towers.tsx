import { useMemo, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAll } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { FlashList } from "@shopify/flash-list";
import { IconBuildingLighthouse } from "@tabler/icons-react-native";
import { useCSSVariable } from "uniwind";
import { Typography } from "@/components/typography";
import { Spacer } from "@/components/spacer";
import { EmptyState } from "@/components/empty-state";
import { TowerCard } from "@/components/tower-card";
import { TowerForm, type TowerData } from "@/components/tower-form";
import { useUser } from "@/hooks/use-user";
import { app } from "@/schema";
import { StyledSafeAreaView } from "@/components/styled-safe-area-view";

export default function TowersScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const { isLoading, organization } = useUser();
  const [editingTower, setEditingTower] = useState<TowerData | undefined>();

  const towers = useAll(
    organization
      ? app.towers.where({ organizationId: organization.id }).include({
          location: true,
        })
      : undefined,
  );

  const members = useAll(
    organization
      ? app.members.where({ organizationId: organization.id })
      : undefined,
  );

  const filteredTowers = useMemo(() => {
    if (!towers) return [];
    if (!q || q.trim() === "") return towers;

    const search = q.toLowerCase();
    return towers.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        String(t.number).includes(search) ||
        t.location?.name?.toLowerCase().includes(search),
    );
  }, [towers, q]);

  const getMemberCount = (towerId: string) => {
    if (!members) return 0;
    return members.filter((m) => m.towerIds?.includes(towerId)).length;
  };

  const openEditTower = (tower: (typeof filteredTowers)[number]) => {
    setEditingTower({
      id: tower.id,
      name: tower.name,
      number: tower.number,
      locationId: tower.locationId,
      status: tower.status,
      main: tower.main,
    });
    TrueSheet.present("edit-tower");
  };

  if (isLoading) return null;

  const isEmpty = towers && towers.length === 0;
  const noResults = filteredTowers.length === 0 && !!q;

  return (
    <>
      <StyledSafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        {isEmpty ? (
          <View className="px-5 pt-4">
            <Spacer size="section" />
            <EmptyState
              icon={<IconBuildingLighthouse size={28} color={primaryColor} />}
              title="Keine Türme"
              description="Erstelle deinen ersten Turm, um loszulegen."
              actionLabel="Turm erstellen"
              onAction={() => TrueSheet.present("create-tower")}
            />
          </View>
        ) : noResults ? (
          <View className="py-12 items-center">
            <Typography
              variant="body-large"
              className="text-on-surface-variant"
            >
              Keine Ergebnisse für "{q}"
            </Typography>
          </View>
        ) : (
          <FlashList
            data={filteredTowers}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-5 pt-4 pb-12"
            contentInsetAdjustmentBehavior="automatic"
            ItemSeparatorComponent={() => <Spacer size="compact" />}
            renderItem={({ item }) => (
              <TowerCard
                name={item.name}
                number={item.number}
                locationName={item.location?.name}
                main={item.main}
                status={item.status}
                memberCount={getMemberCount(item.id)}
                onPress={() => openEditTower(item)}
              />
            )}
          />
        )}
      </StyledSafeAreaView>

      {organization && (
        <>
          <TrueSheet
            name="create-tower"
            detents={[0.9]}
            cornerRadius={24}
            grabber
            backgroundColor="#FFFFFF"
          >
            <TowerForm
              organizationId={organization.id}
              sheetName="create-tower"
            />
          </TrueSheet>

          <TrueSheet
            name="edit-tower"
            detents={[0.9]}
            cornerRadius={24}
            grabber
            backgroundColor="#FFFFFF"
            onDidDismiss={() => setEditingTower(undefined)}
          >
            <TowerForm
              organizationId={organization.id}
              tower={editingTower}
              sheetName="edit-tower"
            />
          </TrueSheet>
        </>
      )}
    </>
  );
}
