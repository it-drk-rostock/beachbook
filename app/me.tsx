import { IconLogout2 } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { Typography } from "@/components/typography";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function MeScreen() {
  const router = useRouter();

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 px-6">
        <View className="flex-1 items-center pt-16">
          <Avatar
            image={{ uri: "", name: "Admin" }}
            size={88}
            backgroundColor="#008CCD"
            showBorder={false}
          />
          <Spacer size="group" />
          <Typography variant="title-large" bold>
            Admin
          </Typography>
        </View>

        <View className="pb-4">
          <Button
            variant="danger-light"
            fullWidth
            onPress={() => {
              // TODO: wire real sign-out flow
              console.log("Sign out pressed");
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
    </StyledSafeAreaView>
  );
}
