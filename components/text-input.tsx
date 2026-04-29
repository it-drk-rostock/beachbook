import React, { forwardRef } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const inputWrapperVariants = tv({
  base: "flex-row items-center border border-outline-variant bg-surface",
  variants: {
    size: {
      sm: "px-4 py-2.5 rounded-md gap-2",
      md: "px-5 py-3.5 rounded-md gap-3",
      lg: "px-6 py-4.5 rounded-md gap-4",
    },
    error: {
      true: "border-error",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    error: false,
  },
});

const inputTextVariants = tv({
  base: "flex-1 text-on-surface p-0",
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface TextInputProps
  extends Omit<RNTextInputProps, "style">,
    VariantProps<typeof inputWrapperVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ leftIcon, rightIcon, size, error, className, ...props }, ref) => {
    return (
      <View className={inputWrapperVariants({ size, error, className })}>
        {leftIcon}
        <RNTextInput
          ref={ref}
          className={inputTextVariants({ size })}
          placeholderTextColorClassName="accent-muted-foreground"
          {...props}
        />
        {rightIcon}
      </View>
    );
  }
);
