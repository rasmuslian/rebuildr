import { Pressable, View } from "react-native";
import dayjs from "dayjs";
import { useState } from "react";
import { Body, Label } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { primitives } from "@constants/colors";

const WEEKDAYS = ["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"];
const MONTHS = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

type Props = {
  /** Selected day as ISO date (YYYY-MM-DD…) or null. */
  value?: string | null;
  onChange: (isoDate: string) => void;
  /** Earliest selectable day (inclusive), ISO date. Earlier days are disabled. */
  minDate?: string | null;
};

/**
 * Lightweight month-view date picker. On-brand: selected day uses Rebuildr
 * green (status colour), today is outlined, disabled days are muted. Pure
 * React Native so it renders identically on native and react-native-web.
 */
export const Calendar = ({ value, onChange, minDate }: Props) => {
  const selected = value ? dayjs(value) : null;
  const min = minDate ? dayjs(minDate).startOf("day") : null;
  const today = dayjs().startOf("day");

  const [visibleMonth, setVisibleMonth] = useState(
    (selected ?? min ?? today).startOf("month"),
  );

  const startOfMonth = visibleMonth.startOf("month");
  const daysInMonth = visibleMonth.daysInMonth();
  // dayjs day(): 0 = Sunday. Shift so Monday = 0 for a Mon-first grid.
  const leadingBlanks = (startOfMonth.day() + 6) % 7;

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day"),
  );
  const cells: (dayjs.Dayjs | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
    ...Array.from(
      { length: 6 * WEEKDAYS.length - leadingBlanks - days.length },
      () => null,
    ),
  ];

  return (
    <View
      style={{
        borderWidth: strokeWidth.regular,
        borderColor: primitives.neutrals300,
        borderRadius: borderRadius.medium,
        padding: 12,
        gap: 8,
        backgroundColor: primitives.neutrals100,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => setVisibleMonth(visibleMonth.subtract(1, "month"))}
          hitSlop={8}
          style={{ padding: 12 }}
        >
          <Icon icon="chevronLeft" size={20} color="primaryDark" />
        </Pressable>
        <Label size="large">
          {MONTHS[visibleMonth.month()]} {visibleMonth.year()}
        </Label>
        <Pressable
          onPress={() => setVisibleMonth(visibleMonth.add(1, "month"))}
          hitSlop={8}
          style={{ padding: 12 }}
        >
          <Icon icon="chevronRight" size={20} color="primaryDark" />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row" }}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={{ flex: 1, alignItems: "center" }}>
            <Body size="small" color="secondary">
              {wd}
            </Body>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((day, i) => {
          if (!day) {
            return (
              <View
                key={`blank-${i}`}
                style={{ width: `${100 / 7}%`, height: 44 }}
              />
            );
          }
          const isSelected = !!selected && day.isSame(selected, "day");
          const isToday = day.isSame(today, "day");
          const isDisabled = !!min && day.isBefore(min, "day");

          return (
            <View
              key={day.toISOString()}
              style={{
                width: `${100 / 7}%`,
                alignItems: "center",
                paddingVertical: 2,
              }}
            >
              <Pressable
                disabled={isDisabled}
                onPress={() => onChange(day.format("YYYY-MM-DD"))}
                style={(state) => {
                  const { focused } = state as { focused?: boolean };
                  return {
                    width: 40,
                    height: 40,
                    borderRadius: borderRadius.full,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected
                      ? primitives.primary700
                      : "transparent",
                    borderWidth:
                      isToday && !isSelected ? strokeWidth.regular : 0,
                    borderColor: primitives.primary700,
                    opacity: isDisabled ? 0.3 : 1,
                    ...(focused && {
                      boxShadow: `0 0 0 2px ${primitives.accent500}`,
                    }),
                  };
                }}
              >
                <Label
                  size="medium"
                  color={isSelected ? "primaryLight" : "primaryDark"}
                >
                  {day.date()}
                </Label>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};
