import { View } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const dividerVariants = tv({
  base: "bg-outline-variant/40",
  variants: {
    inset: {
      true: "mx-4",
      false: "",
    },
    orientation: {
      horizontal: "h-px w-full",
      vertical: "w-px h-full",
    },
  },
  defaultVariants: {
    inset: true,
    orientation: "horizontal",
  },
});

interface DividerProps extends VariantProps<typeof dividerVariants> {
  className?: string;
}

export function Divider({ inset, orientation, className }: DividerProps) {
  return <View className={dividerVariants({ inset, orientation, className })} />;
}
