import { View } from "react-native";

type TowerStatus =
  | "lifeguard_on_duty"
  | "use_caution_when_swimming"
  | "beach_closed"
  | "closed";

interface TowerStatusIconProps {
  status: TowerStatus;
  size?: number;
}

export function TowerStatusIcon({ status, size = 28 }: TowerStatusIconProps) {
  const borderRadius = size * 0.15;

  switch (status) {
    case "lifeguard_on_duty":
      return (
        <View
          style={{ width: size, height: size, borderRadius, overflow: "hidden" }}
        >
          <View style={{ flex: 1, backgroundColor: "#DC2626" }} />
          <View style={{ flex: 1, backgroundColor: "#FACC15" }} />
        </View>
      );

    case "use_caution_when_swimming":
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius,
            backgroundColor: "#FACC15",
          }}
        />
      );

    case "beach_closed":
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius,
            backgroundColor: "#DC2626",
          }}
        />
      );

    case "closed":
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size * 0.14,
            borderColor: "#DC2626",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: size * 0.7,
              height: size * 0.14,
              backgroundColor: "#DC2626",
              transform: [{ rotate: "-45deg" }],
              borderRadius: size * 0.07,
            }}
          />
        </View>
      );
  }
}
