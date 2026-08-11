import { Pressable, View } from "react-native";
import { useEffect, useRef, useState } from "react";
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
 * A labelled date field that expands an inline Calendar on tap. When it opens
 * it nudges itself into view so the calendar isn't hidden below the fold (web;
 * a no-op on native where scrollIntoView doesn't exist).
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
  const calendarRef = useRef<View>(null);

  useEffect(() => {
    if (!open) return;
    // react-native-web renders View as a DOM node, so scrollIntoView exists
    // there; guard so native (no such method) just skips it.
    const node = calendarRef.current as unknown as {
      scrollIntoView?: (opts?: {
        behavior?: "smooth" | "auto";
        block?: "center" | "nearest" | "start" | "end";
      }) => void;
    } | null;
    requestAnimationFrame(() =>
      node?.scrollIntoView?.({ behavior: "smooth", block: "center" }),
    );
  }, [open]);

  return (
    <View style={{ gap: 8 }}>
      <Label size="medium">{label}</Label>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={(state) => {
          // react-native-web adds `focused`; type it in for the focus ring.
          const { focused } = state as { focused?: boolean };
          return {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: strokeWidth.regular,
            // Don't shout red while the picker is open and the user is choosing.
            borderColor:
              error && !open
                ? primitives.semanticError500
                : primitives.neutrals400,
            borderRadius: borderRadius.medium,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: primitives.neutrals100,
            ...(focused && {
              boxShadow: `0 0 0 2px ${primitives.accent500}`,
            }),
          };
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
        <View ref={calendarRef}>
          <Calendar
            value={value}
            minDate={minDate}
            onChange={(d) => {
              onChange(d);
              setOpen(false);
            }}
          />
        </View>
      )}
      {error && (
        <Body size="small" color="error">
          {error}
        </Body>
      )}
    </View>
  );
};
