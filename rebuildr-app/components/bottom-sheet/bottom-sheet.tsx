import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  PropsWithChildren,
  useRef,
  ReactElement,
  useMemo,
  useEffect,
} from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Button } from "@components/buttons/button";
import { BottomSheetModalStackBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = PropsWithChildren<{
  title?: string;
  header?: ReactElement;
  name: string;
  onDismiss?: () => void;
  noPaddingHorizontal?: boolean;
  screenHeight?: boolean;
  scrollable?: boolean;
  footer?: ReactElement;
  isStickyFooter?: boolean;
  stackBehavior?: BottomSheetModalStackBehavior;
  open: boolean;
  containerStyle?: ViewStyle;
}>;

export const BottomSheet = ({
  title,
  header,
  children,
  name,
  onDismiss,
  noPaddingHorizontal,
  screenHeight,
  scrollable,
  footer,
  isStickyFooter,
  open,
  stackBehavior = "push",
  containerStyle,
}: Props) => {
  const safeArea = useSafeAreaInsets();
  const innerRef = useRef<BottomSheetModal>(
    null,
  ) as React.RefObject<BottomSheetModalMethods>;
  const colors = useThemeColor();
  const topBorderRadius = useSharedValue(28);

  useEffect(() => {
    if (open) {
      innerRef.current?.present();
      if (screenHeight && scrollable) {
        topBorderRadius.value = withTiming(0, {
          duration: 500,
          easing: Easing.ease,
        });
      }
    } else {
      topBorderRadius.value = withTiming(28, {
        duration: 500,
        easing: Easing.ease,
      });
      innerRef.current?.dismiss();
    }
  }, [open, scrollable, screenHeight]);

  const animatedBorderRadiusStyle = useAnimatedStyle(() => {
    return {
      borderTopRightRadius: topBorderRadius.value,
      borderTopLeftRadius: topBorderRadius.value,
    };
  });

  const snapPoints = useMemo(
    () => (screenHeight ? ["100%"] : undefined),
    [screenHeight],
  );

  if (!open) {
    return null;
  }

  const renderHeader = () => {
    if (header) {
      return <View>{header}</View>;
    }
    if (!title) {
      return null;
    }

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          marginBottom: 24,
          marginTop: 8,
        }}
      >
        <Title size="medium">{title}</Title>
        <Button icon="X" onPress={() => innerRef.current.close()} type="text" />
      </View>
    );
  };

  return (
    <BottomSheetModal
      stackBehavior={stackBehavior}
      ref={innerRef}
      enableDynamicSizing={!screenHeight}
      enablePanDownToClose={!screenHeight}
      snapPoints={snapPoints}
      animateOnMount
      name={name}
      onDismiss={onDismiss}
      backgroundComponent={() => (
        <Animated.View
          style={[
            animatedBorderRadiusStyle,
            {
              backgroundColor: colors.background.neutral,
              position: "absolute",
              inset: 0,
            },
          ]}
        />
      )}
      handleIndicatorStyle={{
        display: "none",
      }}
      handleComponent={null}
      handleStyle={{
        paddingHorizontal: 16,
      }}
      style={screenHeight && { marginTop: safeArea.top }}
      backdropComponent={({ style }) => (
        <Pressable
          style={[style, { backgroundColor: "#0000004D" }]}
          onPress={() => innerRef.current.close()}
        />
      )}
    >
      {scrollable ? (
        <>
          <BottomSheetScrollView
            style={{
              paddingBottom: safeArea.bottom + 20,
              flex: 1,
            }}
            contentContainerStyle={
              screenHeight && {
                justifyContent: "space-between",
                flex: 1,
              }
            }
          >
            <Animated.View
              style={[
                animatedBorderRadiusStyle,
                {
                  backgroundColor: colors.background.neutral,
                  paddingHorizontal: noPaddingHorizontal ? 0 : 16,
                  flex: 1,
                },
              ]}
            >
              {renderHeader()}
              <View style={[!screenHeight && { flex: 1 }, containerStyle]}>
                {children}
              </View>
              {footer && !isStickyFooter && (
                <View
                  style={{ paddingHorizontal: noPaddingHorizontal ? 0 : 16 }}
                >
                  {footer}
                </View>
              )}
            </Animated.View>
          </BottomSheetScrollView>
          {footer && isStickyFooter && (
            <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
              {footer}
            </View>
          )}
        </>
      ) : (
        <BottomSheetView
          style={[
            {
              paddingBottom: safeArea.bottom + 20,
            },
            screenHeight && { flex: 1 },
          ]}
        >
          <Animated.View
            style={[
              animatedBorderRadiusStyle,
              {
                backgroundColor: colors.background.neutral,
                paddingHorizontal: noPaddingHorizontal ? 0 : 16,
              },
            ]}
          >
            {renderHeader()}
            {children}
          </Animated.View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};
