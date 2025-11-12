import { Button } from "@components/buttons/button";
import { primitives } from "@constants/colors";
import { usePopupContext } from "@context/popup-context";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Easing } from "react-native-reanimated";

export const Popup = () => {
  const { visible, setVisible, content } = usePopupContext();
  const contentAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Using animated to make sure that map is rendering properly on open
    Animated.timing(contentAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Animated.View
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: primitives.neutrals100,
        opacity: contentAnimation,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {content}
      </View>
      <View style={{ position: "absolute", top: 24, right: 18 }}>
        <Button
          label="Stäng"
          onPress={handleClose}
          icon="X"
          iconPosition="right"
          type="filled"
          theme="dark"
          showShadow
        />
      </View>
    </Animated.View>
  );
};
