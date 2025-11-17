import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useSlideInSheetContext } from "@context/slide-in-sheet-context";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useEffect, PropsWithChildren, ReactElement } from "react";
import { ScrollView, View, ViewStyle, useWindowDimensions } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  open: boolean;
  onClose?: () => void;
  onBack?: () => void;
  title?: string;
  style?: ViewStyle;
  footer?: ReactElement;
  bottomMargin?: number;
} & PropsWithChildren;

export const SlideInSheet = ({
  open,
  onClose,
  onBack,
  children,
  title,
  style,
  footer,
  bottomMargin = 20,
}: Props) => {
  const colors = useThemeColor();
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const width = isDesktop ? 500 : screenWidth;

  const { setVisible, setContent } = useSlideInSheetContext();

  const content = (
    <>
      <Pressable onPress={onClose} style={{ width: "100%", height: "100%" }} />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width,
          backgroundColor: colors.background.neutral,
          elevation: 5,
          paddingBottom: bottomMargin,
        }}
      >
        {(title || onBack) && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 8,
                paddingHorizontal: isDesktop ? 48 : 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {onBack && (
                  <Pressable onPress={onBack} style={{ paddingRight: 16 }}>
                    <Icon icon="arrowLeft" size={18} />
                  </Pressable>
                )}
                {title && <Title size="medium">{title}</Title>}
              </View>
              <Button icon="X" onPress={onClose} type="text" />
            </View>
            <View style={{ paddingHorizontal: isDesktop ? 48 : 16 }}>
              <Divider />
            </View>
          </>
        )}
        <ScrollView
          style={[{ paddingTop: 24 }, style]}
          contentContainerStyle={[
            { paddingHorizontal: isDesktop ? 48 : 16 },
            style,
          ]}
        >
          {children}
        </ScrollView>
        {footer && (
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 16,
              marginBottom: 32,
            }}
          >
            {footer}
          </View>
        )}
      </View>
    </>
  );

  useEffect(() => {
    setVisible(open);
    if (open) {
      setContent(content);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setContent(content);
    }
  }, [children]);

  return null;
};
