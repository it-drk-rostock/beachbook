import { Text, TextProps } from "react-native";

/** Loaded in root `useFonts` as `SpaceMono`. */
const NUMERIC_FONT_FAMILY = "SpaceMono";

/**
 * Monospaced numbers for timestamps, coordinates, counts, and grids
 * (Clean-Core numeric readability).
 */
export function NumericText({
  className,
  style,
  ...props
}: TextProps & { className?: string }) {
  return (
    <Text
      className={className}
      style={[{ fontFamily: NUMERIC_FONT_FAMILY }, style]}
      {...props}
    />
  );
}
