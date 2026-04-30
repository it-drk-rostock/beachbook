import { Typography } from "@/components/typography";
import type { TextProps } from "react-native";

interface PageHeaderProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ children, className, ...props }: PageHeaderProps) {
  return (
    <Typography
      variant="headline-large"
      bold
      className={`font-bold tracking-tight ${className ?? ""}`}
      {...props}
    >
      {children}
    </Typography>
  );
}
