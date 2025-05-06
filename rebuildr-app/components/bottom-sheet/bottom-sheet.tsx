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
import { Icon } from "@icons/icon";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";

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
    const safeAre = useSafeAreaInsets();
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
          }}
        >
          <Title
            size="medium"
            style={{
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            {title}
          </Title>
          <Pressable onPress={() => innerRef.current.close()}>
            <Icon icon="X" />
          </Pressable>
        </View>
      );
    };

    return (
      <BottomSheetModal
        ref={innerRef}
        enableDynamicSizing
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
        style={screenHeight && { marginTop: safeAre.top }}
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
              paddingBottom: safeAre.bottom + 20,
              paddingHorizontal: noPaddingHorizontal ? 0 : 16,
            }}
          >
            {renderHeader()}
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView
            style={{
              paddingBottom: safeAre.bottom + 20,
              paddingHorizontal: noPaddingHorizontal ? 0 : 16,
            }}
          >
            {renderHeader()}
            {children}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);
