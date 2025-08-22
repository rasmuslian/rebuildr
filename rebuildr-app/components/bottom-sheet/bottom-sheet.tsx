import {
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
} from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Button } from "@components/buttons/button";

type Props = PropsWithChildren<{
  title?: string;
  name: string;
  onDismiss?: () => void;
  noPaddingHorizontal?: boolean;
  screenHeight?: boolean;
  scrollable?: boolean;
}>;

export const BottomSheet = forwardRef(
  (
    {
      title,
      children,
      name,
      onDismiss,
      noPaddingHorizontal,
      screenHeight,
      scrollable,
    }: Props,
    outerRef: ForwardedRef<BottomSheetModal>,
  ) => {
    const safeArea = useSafeAreaInsets();
    const innerRef =
      useRef<BottomSheetModal>() as React.MutableRefObject<BottomSheetModalMethods>;
    useImperativeHandle(outerRef, () => innerRef?.current, []);
    const colors = useThemeColor();

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
        snapPoints={screenHeight ? ["100%"] : undefined}
        animateOnMount
        name={name}
        onDismiss={onDismiss}
        backgroundStyle={{
          borderRadius: 28,
        }}
        handleIndicatorStyle={{
          display: "none",
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
          >
            {renderHeader()}
            {children}
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
