import { Typography } from "@/components/typography";
import type { TextProps } from "react-native";

interface SectionHeaderProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  children,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <Typography
      variant="headline-small"
      bold
      className={`font-bold ${className ?? ""}`}
      {...props}
    >
      {children}
    </Typography>
  );
}
