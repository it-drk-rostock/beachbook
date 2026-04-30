import React from "react";
import { View } from "react-native";
import { Typography } from "@/components/typography";
import { Button } from "@/components/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="rounded-2xl bg-surface-container py-12 px-8 items-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
        {icon}
      </View>
      <Typography variant="title-large" bold className="text-center">
        {title}
      </Typography>
      <Typography
        variant="body-medium"
        className="text-on-surface-variant text-center mt-2 leading-5"
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <View className="mt-5">
          <Button variant="filled" size="sm" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}
