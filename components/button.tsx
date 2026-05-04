import React from "react";
import { Pressable, PressableProps, Text } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  /** `rounded-lg` = 8px in `@theme` — aligns with Clean-Core controls */
  base: "rounded-lg items-center justify-center flex-row",
  variants: {
    variant: {
      filled: "bg-primary active:opacity-90",
      light: "bg-badge active:opacity-90",
      /** Transparent + primary border (secondary CTAs, towerday “hinzufügen”, Status). */
      secondary: "border border-primary bg-transparent active:opacity-80",
      outline: "border border-outline-variant active:opacity-50",
      subtle: "bg-transparent active:opacity-50",
      danger: "bg-error active:opacity-90",
      "danger-light": "bg-error/10 active:opacity-90",
    },
    size: {
      sm: "px-5 py-2.5",
      md: "px-6 py-4",
      lg: "px-8 py-5",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    variant: "filled",
    size: "md",
    fullWidth: false,
  },
});

const textVariants = tv({
  base: "font-bold",
  variants: {
    variant: {
      filled: "text-on-primary",
      light: "text-primary",
      secondary: "text-primary",
      outline: "text-primary",
      subtle: "text-primary",
      danger: "text-on-error",
      "danger-light": "text-error",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "filled",
    size: "md",
  },
});

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({
  variant,
  size,
  fullWidth,
  children,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={textVariants({ variant, size, className: textClassName })}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
