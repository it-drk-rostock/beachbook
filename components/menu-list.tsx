import React from "react";
import { Pressable, View } from "react-native";
import { IconChevronRight } from "@tabler/icons-react-native";
import { useCSSVariable } from "uniwind";
import { Typography } from "@/components/typography";
import { Divider } from "@/components/divider";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}

export function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  disabled = false,
}: MenuItemProps) {
  const outlineColor = useCSSVariable("--color-outline-variant") as string;

  return (
    <Pressable
      className={`p-4 flex-row items-center gap-3 ${disabled ? "opacity-50" : "active:opacity-70"}`}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="h-10 w-10 items-center justify-center rounded-md bg-badge">
        {icon}
      </View>
      <View className="flex-1">
        <Typography variant="body-large" bold>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body-medium" className="text-on-surface-variant">
            {subtitle}
          </Typography>
        )}
      </View>
      {showChevron && !disabled && (
        <IconChevronRight size={20} color={outlineColor} />
      )}
    </Pressable>
  );
}

interface MenuListProps {
  children: React.ReactNode;
}

export function MenuList({ children }: MenuListProps) {
  const items = React.Children.toArray(children);

  return (
    <View className="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
      {items.map((child, index) => (
        <View key={index}>
          {child}
          {index < items.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  );
}
