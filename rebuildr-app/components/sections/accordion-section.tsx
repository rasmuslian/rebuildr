import { PropsWithChildren, useState } from "react";
import { SectionHeader } from "./section-header";
import { View } from "react-native";

type Props = {
  title?: string;
  collapsedTitle?: string;
  collapsedText?: string;
  expandedTitle?: string;
  initialOpen?: boolean;
} & PropsWithChildren;
export const AccordionSection = ({
  title,
  collapsedTitle,
  collapsedText,
  expandedTitle,
  initialOpen,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(!!initialOpen);

  const headerTitle = isOpen
    ? (expandedTitle ?? title)
    : (collapsedTitle ?? title);

  return (
    <View style={{ gap: 16 }}>
      <SectionHeader
        icon={isOpen ? "chevronUp" : "chevronDown"}
        onPress={() => setIsOpen(!isOpen)}
      >
        {headerTitle ?? ""}
      </SectionHeader>
      {isOpen ? children : null}
    </View>
  );
};
