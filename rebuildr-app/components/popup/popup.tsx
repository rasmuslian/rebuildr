import { Button } from "@components/buttons/button";
import { primitives } from "@constants/colors";
import { usePopupContext } from "@context/popup-context";
import { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Easing } from "react-native-reanimated";

export const Popup = () => {
  const { visible, setVisible, content } = usePopupContext();
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const isVisible = visible !== false;
  const isFull = visible === "full";

  useEffect(() => {
    // Using animated to make sure that map is rendering properly on open
    Animated.timing(contentAnimation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

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
        zIndex: 2000,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        opacity: contentAnimation,
        pointerEvents: isVisible ? "auto" : "none",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!isFull && (
        <Pressable
          onPress={handleClose}
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      <View
        style={{
          flex: isFull ? 1 : undefined,
          width: isFull ? "100%" : "50%",
          height: isFull ? "100%" : "auto",
          backgroundColor: primitives.neutrals100,
          borderRadius: !isFull ? 12 : 0,
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
