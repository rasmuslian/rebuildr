import { Pressable, View } from "react-native";
import { useState } from "react";
import { Body, Label } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { primitives } from "@constants/colors";
import { Calendar } from "./calendar";
import { formatExactDate } from "@/utils/availability";

type Props = {
  label: string;
  value?: string | null;
  onChange: (isoDate: string) => void;
  onClear?: () => void;
  placeholder?: string;
  minDate?: string | null;
  error?: string;
};

/**
 * A labelled date field that shows the chosen date and expands an inline
 * Calendar on tap. Used for "Tillgänglig från" and the optional end date.
 */
export const DateField = ({
  label,
  value,
  onChange,
  onClear,
  placeholder = "Välj datum",
  minDate,
  error,
}: Props) => {
  const [open, setOpen] = useState(false);
  const formatted = formatExactDate(value);

  return (
    <View style={{ gap: 8 }}>
      <Label size="medium">{label}</Label>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: strokeWidth.regular,
          borderColor: error
            ? primitives.semanticError500
            : primitives.neutrals400,
          borderRadius: borderRadius.medium,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: primitives.neutrals100,
        }}
      >
        <Body size="medium" color={formatted ? "primaryDark" : "secondary"}>
          {formatted ?? placeholder}
        </Body>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {formatted && onClear && (
            <Pressable
              onPress={() => {
                onClear();
                setOpen(false);
              }}
              hitSlop={8}
            >
              <Icon icon="X" size={16} color="secondary" />
            </Pressable>
          )}
          <Icon
            icon={open ? "chevronUp" : "chevronDown"}
            size={20}
            color="primaryDark"
          />
        </View>
      </Pressable>
      {open && (
        <Calendar
          value={value}
          minDate={minDate}
          onChange={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
      )}
      {error && (
        <Body size="small" color="error">
          {error}
        </Body>
      )}
    </View>
  );
};
