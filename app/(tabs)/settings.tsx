import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCSSVariable, withUniwind } from "uniwind";
import {
  IconBuildingCommunity,
  IconBuildingLighthouse,
  IconFileText,
  IconBook,
  IconUser,
} from "@tabler/icons-react-native";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { Spacer } from "@/components/spacer";
import { MenuList, MenuItem } from "@/components/menu-list";
import { useUser } from "@/hooks/use-user";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function SettingsScreen() {
  const router = useRouter();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const { isAdmin } = useUser();

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-8"
      >
        <PageHeader>Einstellungen</PageHeader>

        <Spacer size="section" />

        <SectionHeader>Allgemein</SectionHeader>

        <Spacer size="item" />

        <MenuList>
          <MenuItem
            icon={<IconBuildingCommunity size={20} color={primaryColor} />}
            title="Organisation"
            subtitle="Standorte & Mitglieder einladen"
            onPress={() => router.push("/organization")}
            disabled={!isAdmin}
          />
          <MenuItem
            icon={<IconBuildingLighthouse size={20} color={primaryColor} />}
            title="Türme"
            subtitle="Übersicht aller Wachstationen"
            onPress={() => router.push("/towers")}
            disabled={!isAdmin}
          />
          <MenuItem
            icon={<IconFileText size={20} color={primaryColor} />}
            title="Protokolle"
            subtitle="Alle Protokolle anzeigen"
            onPress={() => router.push("/protocols")}
            disabled={!isAdmin}
          />
          <MenuItem
            icon={<IconBook size={20} color={primaryColor} />}
            title="Turmbücher"
            subtitle="Alle Turmbücher öffnen"
            onPress={() => router.push("/towerbooks" as any)}
            disabled={!isAdmin}
          />
        </MenuList>

        <Spacer size="section" />

        <SectionHeader>Nutzerkonto</SectionHeader>

        <Spacer size="item" />

        <MenuList>
          <MenuItem
            icon={<IconUser size={20} color={primaryColor} />}
            title="Account"
            subtitle="Profil verwalten"
            onPress={() => router.push("/me")}
          />
        </MenuList>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
