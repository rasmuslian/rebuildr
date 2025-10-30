import { PropsWithChildren, useState } from "react";
import { SectionHeader } from "./section-header";
import { View } from "react-native";

type Props = {
  title: string;
  initialOpen?: boolean;
  hideGap?: boolean;
} & PropsWithChildren;
export const AccordionSection = ({
  title,
  initialOpen,
  hideGap,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(!!initialOpen);

  return (
    <View style={{ gap: hideGap ? 0 : 16 }}>
      <SectionHeader
        icon={isOpen ? "chevronUp" : "chevronDown"}
        onPress={() => setIsOpen(!isOpen)}
      >
        {title}
      </SectionHeader>
      {isOpen ? children : null}
    </View>
  );
};
