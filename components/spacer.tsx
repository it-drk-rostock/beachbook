import { View } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const spacerVariants = tv({
  variants: {
    size: {
      section: "h-10",
      content: "h-8",
      group: "h-6",
      item: "h-4",
      compact: "h-3",
      inline: "h-2",
    },
  },
  defaultVariants: {
    size: "item",
  },
});

interface SpacerProps extends VariantProps<typeof spacerVariants> {
  className?: string;
}

export function Spacer({ size, className }: SpacerProps) {
  return <View className={spacerVariants({ size, className })} />;
}
