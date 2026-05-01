import { IconLogout2 } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable, withUniwind } from "uniwind";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import QRCode from "react-native-qrcode-svg";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { Typography } from "@/components/typography";
import { MemberNameForm } from "@/components/member-name-form";
import { useUser } from "@/hooks/use-user";
import { useLocalFirstAuth } from "jazz-tools/expo";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function MeScreen() {
  const router = useRouter();
  const primaryColor = useCSSVariable("--color-primary") as string;
  const { name, role, member, session } = useUser();
  const {signOut} = useLocalFirstAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const roleLabel = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "guardleader":
        return "Wachleiter";
      case "towerleader":
        return "Turmleiter";
      default:
        return "";
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 px-6">
        <View className="flex-1 items-center pt-16">
          <Avatar
            image={{ uri: "", name }}
            size={88}
            backgroundColor={primaryColor}
            showBorder={false}
            onLongPress={() => TrueSheet.present("edit-name")}
          />
          <Spacer size="group" />
          <Typography variant="title-large" bold>
            {name}
          </Typography>
          {role && (
            <>
              <Spacer size="inline" />
              <Typography
                variant="body-medium"
                className="text-on-surface-variant"
              >
                Berechtigung: {roleLabel()}
              </Typography>
            </>
          )}
        </View>

        <View className="pb-4">
          <Button
            variant="light"
            fullWidth
            onPress={() => TrueSheet.present("user-qr")}
          >
            QR-Code Nutzerinfo
          </Button>
          <Spacer size="compact" />
          <Button
            variant="danger-light"
            fullWidth
            onPress={() => {
              handleSignOut();
            }}
          >
            <View className="flex-row items-center gap-2">
              <IconLogout2 size={18} color="#BA1A1A" />
              <Typography variant="label-large" className="text-error" bold>
                Abmelden
              </Typography>
            </View>
          </Button>

          <Spacer size="compact" />

          <Button variant="subtle" fullWidth onPress={() => router.back()}>
            Schließen
          </Button>
        </View>
      </View>

      {member && (
        <TrueSheet
          name="edit-name"
          detents={["auto"]}
          cornerRadius={24}
          grabber
          backgroundColor="#FFFFFF"
        >
          <MemberNameForm
            memberId={member.id}
            currentName={member.name}
            onSuccess={() => TrueSheet.dismiss("edit-name")}
            onCancel={() => TrueSheet.dismiss("edit-name")}
          />
        </TrueSheet>
      )}

      <TrueSheet
        name="user-qr"
        detents={["auto"]}
        cornerRadius={24}
        grabber
        backgroundColor="#FFFFFF"
      >
        <View style={{ padding: 24, paddingTop: 8 }} className="items-center">
          <Spacer size="item" />
          <Typography variant="title-large" bold>
            Nutzer QR-Code
          </Typography>
          <Spacer size="item" />
          <Typography variant="body-medium" className="text-on-surface-variant">
            User ID: {session?.user_id ?? "-"}
          </Typography>
          <Spacer size="group" />
          {session?.user_id ? (
            <View className="rounded-xl bg-white p-3">
              <QRCode value={session.user_id} size={220} />
            </View>
          ) : (
            <Typography
              variant="body-medium"
              className="text-on-surface-variant"
            >
              Keine User-ID vorhanden.
            </Typography>
          )}
          <Spacer size="group" />
          <Button
            variant="subtle"
            fullWidth
            onPress={() => TrueSheet.dismiss("user-qr")}
          >
            Schließen
          </Button>
        </View>
      </TrueSheet>
    </StyledSafeAreaView>
  );
}
