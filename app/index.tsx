import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { withUniwind } from "uniwind";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { Spacer } from "@/components/spacer";
import { Typography } from "@/components/typography";
import { AuthView } from "@clerk/expo/native";
import { useAuth } from "@clerk/expo";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function LoginScreen() {
  const { isSignedIn, isLoaded, signOut } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-6">
        <BrandHeader />

        <Spacer size="section" />

        <Typography variant="headline-medium" bold>
          Willkommen zurück
        </Typography>

        <Spacer size="content" />
        {isSignedIn ? (
          <>
            <Typography variant="body-medium" bold>
              Du bist eingeloggt.
            </Typography>
            <Spacer size="item" />
            <Button fullWidth onPress={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <AuthView mode="signInOrUp" />
        )}

        <Spacer size="group" />

        <Button
          variant="outline"
          fullWidth
          onPress={() => router.push("/help")}
        >
          Hilfe
        </Button>
      </View>
    </StyledSafeAreaView>
  );
}
