import { View } from "react-native";
import React, { PropsWithChildren, ReactElement } from "react";
import { Body, Label } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { useRouter } from "expo-router";

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function LinkGroup({ children }: PropsWithChildren) {
  const router = useRouter();
  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const listItems = childrenArray.filter((child) => child.type == "li");

  return (
    <View style={{ marginBottom: 24, gap: 16 }}>
      {listItems.map((listItem, index) => {
        const listItemChildren = React.Children.toArray(
          listItem.props.children,
        ).filter((c): c is ReactElement<ParsedHTMLElementProps> =>
          React.isValidElement(c),
        );

        const label = listItemChildren.find((c) => c.type === "label")?.props
          .children;

        const paragraph = listItemChildren.find((c) => c.type === "p")?.props
          .children;

        const link = listItemChildren.find((c) => c.type === "button")?.props[
          "data-link"
        ];

        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Label size="large" numberOfLines={1} ellipsizeMode="tail">
                {label}
              </Label>

              <Body size="small" numberOfLines={1} ellipsizeMode="tail">
                {paragraph}
              </Body>
            </View>
            <Button
              type="text"
              icon={"arrowRight"}
              onPress={() => router.push(link)}
            />
          </View>
        );
      })}
    </View>
  );
}
