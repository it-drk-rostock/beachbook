import { Text, TextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const typographyVariants = tv({
  base: "text-on-background",
  variants: {
    variant: {
      "display-large": "text-[57px] font-normal tracking-tight",
      "headline-large": "text-[32px] font-normal",
      "headline-medium": "text-[28px] font-normal",
      "headline-small": "text-[24px] font-normal",
      "title-large": "text-[22px] font-normal",
      "title-medium": "text-base font-medium tracking-wide",
      "title-small": "text-sm font-medium tracking-wide",
      "body-large": "text-base font-normal",
      "body-medium": "text-sm font-normal",
      "body-small": "text-xs font-normal",
      "label-large": "text-sm font-medium tracking-wide",
      "label-medium": "text-xs font-medium tracking-wider",
      "label-small": "text-[11px] font-medium tracking-wider",
    },
    bold: {
      true: "font-bold",
    },
  },
  defaultVariants: {
    variant: "body-large",
  },
});

type TypographyVariant = VariantProps<typeof typographyVariants>["variant"];

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  bold?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Typography({
  variant,
  bold,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      className={typographyVariants({ variant, bold, className })}
      {...props}
    >
      {children}
    </Text>
  );
}
