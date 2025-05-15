import { Body, Headline, Title } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { PropsWithChildren, useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  title: string;
  collapsedText?: string;
  initialOpen?: boolean;
} & PropsWithChildren;

export const FilterSection = ({
  title,
  collapsedText,
  initialOpen,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(!!initialOpen);

  return (
    <View>
      <Pressable onPress={() => setIsOpen(!isOpen)}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isOpen ? (
            <Headline size="small">{title}</Headline>
          ) : (
            <View>
              <Title size="medium" style={{ marginBottom: 4 }}>
                {title}
              </Title>
              {collapsedText && (
                <Body
                  size="medium"
                  color="secondary"
                  style={{ marginBottom: 12 }}
                >
                  {collapsedText}
                </Body>
              )}
            </View>
          )}
          <Icon size={18} icon={isOpen ? "chevronUp" : "chevronDown"} />
        </View>
      </Pressable>
      {isOpen && (
        <View style={{ marginBottom: 24, marginTop: 16 }}>{children}</View>
      )}
    </View>
  );
};
