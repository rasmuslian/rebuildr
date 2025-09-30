import React, { ReactElement, useRef, useState } from "react";
import { View, Animated, Easing } from "react-native";
import { Button } from "@components/buttons/button";
import { Icon } from "@icons/icon";

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
}

type Props = {
  children: React.ReactNode;
  isOpen?: boolean;
};

export default function Accordion({ children, isOpen = true }: Props) {
  const [contentExpanded, setContentExpanded] = useState(isOpen);
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const contentRef = useRef(0);

  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const summary = childrenArray[0];
  const content = childrenArray.slice(1);

  const toggleAccordion = () => {
    const toValue = contentExpanded ? 0 : contentRef.current;
    setContentExpanded((prev) => !prev);

    Animated.timing(contentAnimation, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    Animated.timing(rotateAnimation, {
      toValue: contentExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {summary}

        <Button
          type="text"
          icon={
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Icon icon="chevronDown" size={18} color="primaryDark" />
            </Animated.View>
          }
          onPress={toggleAccordion}
        />
      </View>

      <Animated.View style={{ height: contentAnimation, overflow: "hidden" }}>
        <View
          style={{ marginTop: 12 }}
          onLayout={(e) => {
            contentRef.current = e.nativeEvent.layout.height;
            if (contentExpanded) contentAnimation.setValue(contentRef.current);
          }}
        >
          {content}
        </View>
      </Animated.View>
    </View>
  );
}
