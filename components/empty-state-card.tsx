import { Typography } from "@/components/typography";
import React from "react";
import { Pressable, View } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const cardVariants = tv({
  base: "rounded-2xl p-5 active:opacity-90",
  variants: {
    tone: {
      primary: "bg-primary/10",
      surface: "bg-surface-container",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

interface EmptyStateCardProps extends VariantProps<typeof cardVariants> {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

export function EmptyStateCard({
  tone,
  icon,
  title,
  description,
  onPress,
}: EmptyStateCardProps) {
  return (
    <Pressable className={cardVariants({ tone })} onPress={onPress}>
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
        {icon}
      </View>
      <Typography variant="title-medium" bold className="text-on-surface">
        {title}
      </Typography>
      <Typography
        variant="body-medium"
        className="mt-1 text-on-surface-variant leading-5"
      >
        {description}
      </Typography>
    </Pressable>
  );
}
