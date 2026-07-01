import { Image as ExpoImage } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import SendVector from "@assets/svgs/send-vector.svg";
import { primitives } from "@constants/colors";
import { useScreenType } from "@hooks/useScreenType";
import { Icon } from "@icons/icon";

type BygghjalpenPromptBoxProps = {
  autoFocus?: boolean;
  bordered?: boolean;
  compact?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onKeyPress?: TextInputProps["onKeyPress"];
  onSubmit: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  value: string;
};

export const BygghjalpenPromptBox = React.forwardRef<
  TextInput,
  BygghjalpenPromptBoxProps
>(
  (
    {
      autoFocus = false,
      bordered = false,
      compact = false,
      disabled = false,
      loading = false,
      onChangeText,
      onKeyPress,
      onSubmit,
      placeholder = "Ställ din fråga här",
      style,
      value,
    },
    ref,
  ) => {
    const { isDesktop } = useScreenType();
    const [contentHeight, setContentHeight] = React.useState(20);
    const compactInputHeight = Math.min(Math.max(contentHeight, 24), 132);

    const handleContentSizeChange = (
      event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
    ) => {
      setContentHeight(event.nativeEvent.contentSize.height);
    };

    return (
      <View
        style={[
          {
            backgroundColor: primitives.neutrals100,
            borderColor: primitives.neutrals300,
            borderRadius: isDesktop ? 8 : 9,
            borderWidth: bordered ? 1 : 0,
            height: compact ? undefined : isDesktop ? 123 : 162,
            minHeight: compact ? (isDesktop ? 78 : 88) : undefined,
            paddingBottom: compact ? 12 : isDesktop ? 12 : 14,
            paddingHorizontal: compact ? 12 : isDesktop ? 12 : 18,
            paddingTop: compact ? 12 : isDesktop ? 12 : 18,
            width: "100%",
          },
          style,
        ]}
      >
        <TextInput
          ref={ref}
          autoFocus={autoFocus}
          editable={!loading}
          multiline
          onChangeText={onChangeText}
          onContentSizeChange={compact ? handleContentSizeChange : undefined}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          placeholderTextColor={primitives.neutrals800}
          value={value}
          style={{
            color: primitives.neutrals900,
            flex: compact ? undefined : 1,
            fontFamily: "Inter-Regular",
            fontSize: 14,
            height: compact ? compactInputHeight : undefined,
            lineHeight: 20,
            maxHeight: compact ? 132 : undefined,
            outlineColor: "transparent",
            outlineWidth: 0,
            padding: 0,
            textAlignVertical: "top",
          }}
        />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: isDesktop ? 8 : 10 }}>
            <PromptIconButton icon="paperclip" />
            <PromptIconButton icon="addPhoto" />
          </View>
          <PromptSendButton
            disabled={disabled || loading}
            loading={loading}
            onPress={onSubmit}
          />
        </View>
      </View>
    );
  },
);

BygghjalpenPromptBox.displayName = "BygghjalpenPromptBox";

const PromptSendButton = ({
  disabled,
  loading,
  onPress,
}: {
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      accessibilityLabel="Skicka fråga"
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            alignItems: "center",
            backgroundColor: disabled
              ? primitives.neutrals300
              : hovered || pressed
                ? primitives.accent400
                : primitives.accent500,
            borderRadius: 999,
            height: 32,
            justifyContent: "center",
            opacity: pressed ? 0.88 : 1,
            width: 32,
          }}
        >
          {loading ? (
            <ActivityIndicator color={primitives.neutrals100} size="small" />
          ) : (
            <ExpoImage
              source={SendVector.uri}
              style={{ height: 14, width: 16 }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const PromptIconButton = ({ icon }: { icon: "paperclip" | "addPhoto" }) => {
  return (
    <Pressable
      accessibilityLabel={
        icon === "paperclip" ? "Bifoga fil" : "Lägg till bild"
      }
      accessibilityRole="button"
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            alignItems: "center",
            height: 24,
            justifyContent: "center",
            opacity: hovered || pressed ? 0.7 : 1,
            width: 24,
          }}
        >
          <Icon icon={icon} customColor={primitives.neutrals600} size={22} />
        </View>
      )}
    </Pressable>
  );
};
