import { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useCSSVariable } from "uniwind";
import { useAll, useDb } from "jazz-tools/react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import {
  IconBuildingCommunity,
  IconUsersGroup,
  IconMapPin,
  IconPlus,
  IconUser,
} from "@tabler/icons-react-native";
import { Typography } from "@/components/typography";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { SectionHeader } from "@/components/section-header";
import { Spacer } from "@/components/spacer";
import { EmptyState } from "@/components/empty-state";
import { LocationForm } from "@/components/location-form";
import { OrganizationForm } from "@/components/organization-form";
import { useUser } from "@/hooks/use-user";
import { app } from "@/schema";

export default function OrganizationScreen() {
  const primaryColor = useCSSVariable("--color-primary") as string;
  const db = useDb();
  const { isLoading, member, organization, isAdmin, session } = useUser();
  const [activeLocation, setActiveLocation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const orgData = useAll(
    organization
      ? app.organizations
          .where({ id: organization.id })
          .include({
            locationsViaOrganization: true,
            membersViaOrganization: true,
          })
      : undefined,
  );

  const locations = orgData?.[0]?.locationsViaOrganization ?? [];
  const orgMembers = orgData?.[0]?.membersViaOrganization ?? [];

  const dismissSheet = (name: string) => TrueSheet.dismiss(name);

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "guardleader":
        return "Wachleiter";
      case "towerleader":
        return "Turmleiter";
      default:
        return role;
    }
  };

  if (isLoading) {
    return <View className="flex-1 bg-background" />;
  }

  if (!member || !organization) {
    return (
      <View className="flex-1 bg-background px-6 pt-4">
        <EmptyState
          icon={<IconBuildingCommunity size={28} color={primaryColor} />}
          title="Keine Organisation"
          description="Du bist noch keiner Organisation beigetreten. Frage deinen Wachleiter oder erstelle deine eigene."
          actionLabel="Organisation erstellen"
          onAction={() => TrueSheet.present("org-create")}
        />
        <TrueSheet
          name="org-create"
          detents={["auto"]}
          cornerRadius={24}
          grabber
          backgroundColor="#FFFFFF"
        >
          <OrganizationForm
            onSuccess={() => dismissSheet("org-create")}
            onCancel={() => dismissSheet("org-create")}
          />
        </TrueSheet>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-8 pt-4"
    >
      {/* Org Name Card */}
      {isAdmin ? (
        <Pressable
          className="rounded-2xl bg-primary/5 p-4 flex-row items-center gap-3 active:opacity-80"
          onPress={() => TrueSheet.present("org-edit")}
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <IconBuildingCommunity size={20} color={primaryColor} />
          </View>
          <Typography variant="body-large" bold className="flex-1">
            {organization.name}
          </Typography>
        </Pressable>
      ) : (
        <View className="rounded-2xl bg-primary/5 p-4 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <IconBuildingCommunity size={20} color={primaryColor} />
          </View>
          <Typography variant="body-large" bold className="flex-1">
            {organization.name}
          </Typography>
        </View>
      )}

      <Spacer size="compact" />

      {/* Invite Button - only for admins */}
      {isAdmin && (
        <Button
          variant="light"
          fullWidth
          onPress={() => {
            /* TODO: Invite bottom sheet */
          }}
        >
          <View className="flex-row items-center gap-2">
            <IconUsersGroup size={20} color={primaryColor} />
            <Typography variant="body-large" bold className="text-primary">
              Mitglieder einladen
            </Typography>
          </View>
        </Button>
      )}

      <Spacer size="section" />

      {/* Standorte Section */}
      <View className="flex-row items-center justify-between">
        <SectionHeader>Standorte</SectionHeader>
        {isAdmin && (
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-50"
            onPress={() => TrueSheet.present("location-create")}
          >
            <IconPlus size={22} color={primaryColor} />
          </Pressable>
        )}
      </View>

      <Spacer size="item" />

      {locations.length > 0 ? (
        locations.map((location) => (
          <Pressable
            key={location.id}
            className="rounded-2xl bg-surface-container p-4 flex-row items-center gap-3 mb-3 active:opacity-80"
            onPress={() => {
              if (!isAdmin) return;
              setActiveLocation({
                id: location.id,
                name: location.name,
              });
              TrueSheet.present("location-edit");
            }}
            disabled={!isAdmin}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <IconMapPin size={20} color={primaryColor} />
            </View>
            <Typography variant="body-large" className="flex-1">
              {location.name}
            </Typography>
          </Pressable>
        ))
      ) : (
        <View className="rounded-2xl bg-surface-container p-4 items-center">
          <Typography
            variant="body-medium"
            className="text-on-surface-variant"
          >
            Noch keine Standorte hinzugefügt.
          </Typography>
        </View>
      )}

      <Spacer size="section" />

      {/* Mitglieder Section */}
      <View className="flex-row items-center justify-between">
        <SectionHeader>Mitglieder</SectionHeader>
        <View className="h-7 min-w-7 items-center justify-center rounded-full bg-surface-container px-2">
          <Typography
            variant="label-medium"
            className="text-on-surface-variant"
          >
            {orgMembers.length}
          </Typography>
        </View>
      </View>

      <Spacer size="item" />

      {/* Members Container */}
      {orgMembers.length > 0 ? (
        <View className="rounded-2xl bg-surface-container overflow-hidden">
          {orgMembers.map((m, index) => (
            <View key={m.id}>
              <View className="p-4 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <IconUser size={20} color={primaryColor} />
                </View>
                <Typography variant="body-large" className="flex-1">
                  {m.name}
                  {m.user_id === session?.user_id && (
                    <Typography
                      variant="body-large"
                      className="text-on-surface-variant"
                    >
                      {" "}
                      (ich)
                    </Typography>
                  )}
                </Typography>
                {m.role === "admin" ? (
                  <View className="rounded-full bg-primary px-3 py-1">
                    <Typography
                      variant="label-medium"
                      className="text-on-primary"
                    >
                      Admin
                    </Typography>
                  </View>
                ) : (
                  <Typography
                    variant="body-medium"
                    className="text-on-surface-variant"
                  >
                    {roleLabel(m.role)}
                  </Typography>
                )}
              </View>
              {index < orgMembers.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      ) : (
        <View className="rounded-2xl bg-surface-container p-4 items-center">
          <Typography
            variant="body-medium"
            className="text-on-surface-variant"
          >
            Noch keine Mitglieder.
          </Typography>
        </View>
      )}

      {isAdmin && (
        <>
          <TrueSheet
            name="org-edit"
            detents={["auto"]}
            cornerRadius={24}
            grabber
            backgroundColor="#FFFFFF"
          >
            <OrganizationForm
              organization={{ id: organization.id, name: organization.name }}
              onSuccess={() => dismissSheet("org-edit")}
              onCancel={() => dismissSheet("org-edit")}
            />
          </TrueSheet>

          <TrueSheet
            name="location-create"
            detents={["auto"]}
            cornerRadius={24}
            grabber
            backgroundColor="#FFFFFF"
          >
            <LocationForm
              organizationId={organization.id}
              onSuccess={() => dismissSheet("location-create")}
              onCancel={() => dismissSheet("location-create")}
            />
          </TrueSheet>

          <TrueSheet
            name="location-edit"
            detents={["auto"]}
            cornerRadius={24}
            grabber
            backgroundColor="#FFFFFF"
          >
            {activeLocation ? (
              <LocationForm
                organizationId={organization.id}
                location={activeLocation}
                onSuccess={() => {
                  dismissSheet("location-edit");
                  setActiveLocation(null);
                }}
                onCancel={() => {
                  dismissSheet("location-edit");
                  setActiveLocation(null);
                }}
                onDelete={() => {
                  if (!activeLocation) return;
                  db.delete(app.locations, activeLocation.id);
                  dismissSheet("location-edit");
                  setActiveLocation(null);
                }}
              />
            ) : (
              <View style={{ padding: 24 }}>
                <Typography variant="body-medium" className="text-on-surface-variant">
                  Kein Standort ausgewählt.
                </Typography>
              </View>
            )}
          </TrueSheet>
        </>
      )}
    </ScrollView>
  );
}
