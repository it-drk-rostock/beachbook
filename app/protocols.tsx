import { useMemo, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAll } from "jazz-tools/react-native";
import { FlashList } from "@shopify/flash-list";
import { TabView, TabBar } from "react-native-tab-view";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconClipboardList,
  IconClipboardCheck,
  IconChevronRight,
} from "@tabler/icons-react-native";
import { app } from "@/schema";
import { Typography } from "@/components/typography";
import { Spacer } from "@/components/spacer";
import { EmptyState } from "@/components/empty-state";
import { useUser } from "@/hooks/use-user";
import { StyledSafeAreaView } from "@/components/styled-safe-area-view";
import {
  ProtocolForm,
  type ProtocolData,
} from "@/components/protocol-form";

const statusLabels: Record<string, string> = {
  open: "Offen",
  ongoing: "In Bearbeitung",
  completed: "Abgeschlossen",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-on-surface/10", text: "text-on-surface-variant" },
  ongoing: { bg: "bg-warning/15", text: "text-warning" },
  completed: { bg: "bg-success/15", text: "text-success" },
};

function ProtocolsTab({
  onSelectProtocol,
}: {
  onSelectProtocol: (p: ProtocolData) => void;
}) {
  const { member } = useUser();
  const { q } = useLocalSearchParams<{ q?: string }>();

  const protocols = useAll(
    member
      ? app.protocols.where({ organizationId: member.organizationId })
      : undefined,
  );

  const filtered = useMemo(() => {
    if (!protocols) return [];
    if (!q || q.trim() === "") return protocols;
    const lower = q.toLowerCase();
    return protocols.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower),
    );
  }, [protocols, q]);

  if (protocols && protocols.length === 0) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <EmptyState
          icon={<IconClipboardList size={28} color="#008CCD" />}
          title="Keine Protokolle"
          description="Es wurden noch keine Protokolle für diese Organisation erstellt."
          actionLabel="Protokoll erstellen"
          onAction={() => TrueSheet.present("create-protocol")}
        />
      </View>
    );
  }

  if (protocols && filtered.length === 0 && q) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <EmptyState
          icon={<IconClipboardList size={28} color="#008CCD" />}
          title="Keine Treffer"
          description={`Kein Protokoll gefunden für „${q}".`}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 py-4"
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl border border-outline-variant bg-surface p-4 active:opacity-80"
            onPress={() =>
              onSelectProtocol({
                id: item.id,
                name: item.name,
                description: item.description ?? null,
              })
            }
          >
            <View className="flex-row items-center justify-between">
              <View className="mr-3 flex-1">
                <Typography variant="title-medium" bold>
                  {item.name}
                </Typography>
                {item.description ? (
                  <>
                    <Spacer size="inline" />
                    <Typography
                      variant="body-medium"
                      className="text-on-surface-variant"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Typography>
                  </>
                ) : null}
              </View>
              <IconChevronRight size={20} color="#C1C7CE" />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function SubmissionsTab() {
  const { member } = useUser();
  const router = useRouter();

  const submissions = useAll(
    member
      ? app.submissions
          .where({ organizationId: member.organizationId })
          .include({ protocol: true, tower: true })
      : undefined,
  );

  const sorted = submissions
    ? [...submissions].sort((a, b) => {
        const dateA =
          typeof a.date === "number" ? a.date : new Date(a.date).getTime();
        const dateB =
          typeof b.date === "number" ? b.date : new Date(b.date).getTime();
        return dateB - dateA;
      })
    : [];

  if (submissions && submissions.length === 0) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <EmptyState
          icon={<IconClipboardCheck size={28} color="#008CCD" />}
          title="Keine Einreichungen"
          description="Es wurden noch keine Protokolle eingereicht."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 py-4"
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const dateVal =
            typeof item.date === "number"
              ? item.date
              : new Date(item.date).getTime();
          const formattedDate = new Date(dateVal).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const colors = statusColors[item.status] ?? statusColors.open;

          return (
            <Pressable
              className="rounded-2xl border border-outline-variant bg-surface p-4 active:opacity-80"
              onPress={() => router.push(`/submission/${item.id}` as any)}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Typography variant="title-medium" bold>
                    {item.protocol?.name ?? "–"}
                  </Typography>
                  <Spacer size="inline" />
                  <Typography
                    variant="body-medium"
                    className="text-on-surface-variant"
                  >
                    {item.tower?.name ?? "–"}{" "}
                    {item.tower?.number != null ? item.tower.number : ""}
                  </Typography>
                </View>
                <IconChevronRight size={20} color="#C1C7CE" />
              </View>
              <Spacer size="inline" />
              <View className="flex-row items-center gap-2">
                <Typography
                  variant="body-small"
                  className="text-on-surface-variant"
                >
                  {formattedDate}
                </Typography>
                <View className={`rounded-full px-2.5 py-0.5 ${colors.bg}`}>
                  <Typography
                    variant="label-small"
                    bold
                    className={colors.text}
                  >
                    {statusLabels[item.status] ?? item.status}
                  </Typography>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const routes = [
  { key: "protocols", title: "Protokolle" },
  { key: "submissions", title: "Einreichungen" },
];

export default function ProtocolsScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const { member } = useUser();
  const router = useRouter();
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolData | null>(
    null,
  );

  const handleSelectProtocol = (protocol: ProtocolData) => {
    setSelectedProtocol(protocol);
    TrueSheet.present("edit-protocol");
  };

  const handleCreated = async () => {
    await TrueSheet.dismiss("create-protocol");
  };

  const handleEditSaved = async () => {
    await TrueSheet.dismiss("edit-protocol");
    setSelectedProtocol(null);
  };

  const handleDeleted = async () => {
    await TrueSheet.dismiss("edit-protocol");
    setSelectedProtocol(null);
  };

  const handleOpenDesigner = async (id: string) => {
    await TrueSheet.dismiss("edit-protocol");
    setSelectedProtocol(null);
    router.push(`/protocol/${id}` as any);
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "protocols":
        return <ProtocolsTab onSelectProtocol={handleSelectProtocol} />;
      case "submissions":
        return <SubmissionsTab />;
      default:
        return null;
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-2">
        <Typography variant="headline-large" bold>
          Protokolle
        </Typography>
      </View>
      <Spacer size="item" />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        commonOptions={{
          labelStyle: {
            fontWeight: "700",
            fontSize: 13,
            textTransform: "none",
          },
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            activeColor="#008CCD"
            inactiveColor="#41484F"
            pressColor="rgba(0,140,205,0.08)"
            indicatorStyle={{
              backgroundColor: "#008CCD",
              height: 3,
              borderRadius: 1.5,
            }}
            style={{
              backgroundColor: "#FFFFFF",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: "#C1C7CE",
            }}
          />
        )}
      />

      {/* Create Protocol Sheet */}
      <TrueSheet
        name="create-protocol"
        detents={["auto"]}
        cornerRadius={24}
        backgroundColor="#fff"
      >
        <ProtocolForm
          organizationId={member?.organizationId ?? ""}
          onDismiss={() => TrueSheet.dismiss("create-protocol")}
          onSaved={handleCreated}
        />
      </TrueSheet>

      {/* Edit Protocol Sheet */}
      <TrueSheet
        name="edit-protocol"
        detents={["auto"]}
        cornerRadius={24}
        backgroundColor="#fff"
        onDidDismiss={() => setSelectedProtocol(null)}
      >
        <ProtocolForm
          organizationId={member?.organizationId ?? ""}
          protocol={selectedProtocol}
          onDismiss={() => TrueSheet.dismiss("edit-protocol")}
          onSaved={handleEditSaved}
          onDeleted={handleDeleted}
          onOpenDesigner={handleOpenDesigner}
        />
      </TrueSheet>
    </StyledSafeAreaView>
  );
}
