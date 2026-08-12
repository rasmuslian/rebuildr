import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  ReactElement,
  useMemo,
  useEffect,
} from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isWeb, WEB_FIXED } from "@constants/layout";
import { useDocumentScrollLock } from "@hooks/useDocumentScrollLock";
import { SheetPortal } from "./sheet-portal";
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

//true once a sheet has opened its viewport-fixed box on web. A sheet rendered
//inside another sheet reads this and skips its own box, so it shares the outer
//sheet's provider — nesting two boxes (each with its own provider portaled to
//body) leaves the inner modal unable to present.
const SheetBoxContext = createContext(false);

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
  const insideSheetBox = useContext(SheetBoxContext);
  const innerRef = useRef<BottomSheetModal>(
    null,
  ) as React.RefObject<BottomSheetModalMethods>;
  const scrollRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);
  const colors = useThemeColor();
  const sheetBackgroundColor = backgroundColor ?? colors.background.neutral;
  const topBorderRadius = useSharedValue(28);

  //a sheet that owns the whole screen needs a shell that is exactly one screen
  //tall to measure itself against
  useDocumentScrollLock(open && !!screenHeight);

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

  const sheet = (
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

  //A modal presents into the nearest provider, and that provider's host is what
  //the sheet measures its height and position from. The app-root host sits in
  //the app shell, which grows with the page so the document can scroll and the
  //browser chrome can collapse — measured against a long page a sheet ends up
  //several screens tall, or rests far below the fold. Its own provider inside a
  //viewport-fixed box (portaled to body so page chrome can't paint over it)
  //gives it a one-screen container to measure against.
  //
  //But a sheet opened from inside another sheet must NOT box itself: two nested
  //boxes each portal their own provider to body, and the inner modal then never
  //presents. Such a sheet shares the outer box's provider instead — same
  //viewport-fixed host, and one shared provider keeps stacking and dismiss
  //working across the two.
  if (isWeb && !insideSheetBox) {
    return (
      <SheetPortal>
        <View
          style={{
            position: WEB_FIXED,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <BottomSheetModalProvider>
            <SheetBoxContext.Provider value>{sheet}</SheetBoxContext.Provider>
          </BottomSheetModalProvider>
        </View>
      </SheetPortal>
    );
  }

  return sheet;
};
