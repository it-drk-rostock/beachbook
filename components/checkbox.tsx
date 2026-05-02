import { Pressable, View } from "react-native";
import { Typography } from "@/components/typography";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 rounded-md border px-5 py-3.5 active:opacity-80 ${
        checked
          ? "border-primary bg-primary/5"
          : "border-outline-variant bg-surface"
      } ${disabled ? "opacity-50" : ""}`}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <View
        className={`h-5 w-5 rounded items-center justify-center ${
          checked ? "bg-primary" : "border-2 border-outline-variant"
        }`}
      >
        {checked && (
          <Typography variant="label-small" className="text-on-primary">
            ✓
          </Typography>
        )}
      </View>
      {label && <Typography variant="body-large">{label}</Typography>}
    </Pressable>
  );
}
