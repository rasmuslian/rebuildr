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
  backgroundColor?: string;
  //when this value changes, the scroll position resets to the top. Pass the
  //current wizard step so each step starts scrolled to the top instead of
  //inheriting the previous (taller) step's offset.
  resetScrollKey?: string | number;
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
  backgroundColor,
  resetScrollKey,
}: Props) => {
  const safeArea = useSafeAreaInsets();
  const innerRef = useRef<BottomSheetModal>(
    null,
  ) as React.RefObject<BottomSheetModalMethods>;
  const scrollRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);
  const colors = useThemeColor();
  const sheetBackgroundColor = backgroundColor ?? colors.background.neutral;
  const topBorderRadius = useSharedValue(28);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [resetScrollKey]);

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
              backgroundColor: sheetBackgroundColor,
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
            ref={scrollRef}
            style={{
              paddingBottom: safeArea.bottom + 20,
              flex: 1,
            }}
            contentContainerStyle={
              screenHeight && {
                justifyContent: "space-between",
                flexGrow: 1,
              }
            }
          >
            <Animated.View
              style={[
                animatedBorderRadiusStyle,
                {
                  backgroundColor: sheetBackgroundColor,
                  paddingHorizontal: noPaddingHorizontal ? 0 : 16,
                  //flexGrow, not flex: flex (flexBasis 0 + shrink) clamps the
                  //content to the viewport height, so a form taller than the
                  //screen reports contentHeight == frameHeight. The sheet then
                  //treats it as non-scrollable and steals vertical pans — you
                  //can drift down but never scroll back up. flexGrow fills the
                  //screen when content is short yet lets it grow and scroll when
                  //tall.
                  flexGrow: 1,
                },
              ]}
            >
              {renderHeader()}
              {/* no forced flex here: a dynamically sized sheet must hug its
                  content — a flex-stretched wrapper distorts the intrinsic
                  height the dynamic sizing measures on web, so sheets end up
                  taller than their content. Callers that want to fill pass it
                  via containerStyle. */}
              <View style={[containerStyle]}>{children}</View>
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
                backgroundColor: sheetBackgroundColor,
                paddingHorizontal: noPaddingHorizontal ? 0 : 16,
              },
            ]}
          >
            {renderHeader()}
            <View style={[containerStyle]}>{children}</View>
          </Animated.View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
};
