import { View } from "react-native";
import React, { PropsWithChildren, ReactElement } from "react";
import { Headline, Body } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Button } from "@components/buttons/button";
import { router } from "expo-router";

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function CTABlock({ children }: PropsWithChildren) {
  const colors = useThemeColor();

  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const title = childrenArray.find((c) => c.type === "h2")?.props.children;
  const description = childrenArray.find((c) => c.type === "p")?.props.children;

  const button = childrenArray.find((c) => c.type === "button");
  const buttonLabel = button?.props.children?.toString();
  const buttonLink = button?.props["data-link"];

  return (
    <View
      style={{
        gap: 24,
        padding: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.medium,
      }}
    >
      <View style={{ gap: 16 }}>
        <Headline style={{ textAlign: "center" }} size="small">
          {title}
        </Headline>

        <Body style={{ textAlign: "center" }} size="medium">
          {description}
        </Body>
      </View>

      <Button label={buttonLabel} onPress={() => router.push(buttonLink)} />
    </View>
  );
}
