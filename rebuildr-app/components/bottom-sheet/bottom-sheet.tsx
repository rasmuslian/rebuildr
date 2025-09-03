import {
  BottomSheetHandleProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  PropsWithChildren,
  useRef,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
  ReactElement,
  useMemo,
} from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Button } from "@components/buttons/button";

type Props = PropsWithChildren<{
  title?: string;
  header?: ReactElement;
  name: string;
  onDismiss?: () => void;
  noPaddingHorizontal?: boolean;
  screenHeight?: boolean;
  scrollable?: boolean;
  footer?: ReactElement;
}>;

export const BottomSheet = forwardRef(
  (
    {
      title,
      header,
      children,
      name,
      onDismiss,
      noPaddingHorizontal,
      screenHeight,
      scrollable,
      footer,
    }: Props,
    outerRef: ForwardedRef<BottomSheetModal>,
  ) => {
    const safeArea = useSafeAreaInsets();
    const innerRef =
      useRef<BottomSheetModal>() as React.MutableRefObject<BottomSheetModalMethods>;
    useImperativeHandle(outerRef, () => innerRef?.current, []);
    const colors = useThemeColor();

    const snapPoints = useMemo(
      () => (screenHeight ? ["100%"] : undefined),
      [screenHeight],
    );

    const headerWrapper: React.FC<BottomSheetHandleProps> = () => {
      if (!header) {
        return;
      }
      return <View style={{ paddingHorizontal: 16 }}>{header}</View>;
    };

    const renderHeader = () => {
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
          <Button
            icon="X"
            onPress={() => innerRef.current.close()}
            type="text"
          />
        </View>
      );
    };

    return (
      <BottomSheetModal
        ref={innerRef}
        enableDynamicSizing={!screenHeight}
        enablePanDownToClose
        snapPoints={snapPoints}
        animateOnMount
        name={name}
        onDismiss={onDismiss}
        backgroundStyle={{
          borderRadius: 28,
        }}
        handleIndicatorStyle={{
          display: "none",
        }}
        handleComponent={headerWrapper}
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
          <BottomSheetScrollView
            style={{
              paddingBottom: safeArea.bottom + 20,
              paddingHorizontal: noPaddingHorizontal ? 0 : 16,
            }}
            contentContainerStyle={[
              screenHeight && {
                flex: 1,
              },
            ]}
          >
            {renderHeader()}
            <View style={[!screenHeight && { flex: 1 }]}>{children}</View>
            {footer && footer}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView
            style={[
              {
                paddingBottom: safeArea.bottom + 20,
                paddingHorizontal: noPaddingHorizontal ? 0 : 16,
              },
              screenHeight && { flex: 1 },
            ]}
          >
            {renderHeader()}
            {children}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);
