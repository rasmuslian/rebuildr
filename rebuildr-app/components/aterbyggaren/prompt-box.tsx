import { Image as ExpoImage } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleProp,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextInputKeyPressEventData,
  TextInputProps,
  Text,
  View,
  ViewStyle,
} from "react-native";

import SendVector from "@assets/svgs/send-vector.svg";
import { primitives } from "@constants/colors";
import { useScreenType } from "@hooks/useScreenType";
import { Icon } from "@icons/icon";
import type { AterbyggarenPromptAttachment } from "@/lib/aterbyggaren-attachments";

export type { AterbyggarenPromptAttachment } from "@/lib/aterbyggaren-attachments";

const COMPACT_INPUT_LINE_HEIGHT = 20;
const COMPACT_INPUT_VERTICAL_PADDING = 4;
const MIN_COMPACT_INPUT_CONTENT_HEIGHT = COMPACT_INPUT_LINE_HEIGHT;

const getExplicitLineCount = (text: string) => text.split(/\r\n|\r|\n/).length;

const getMinContentHeightForValue = (text: string) =>
  getExplicitLineCount(text) * COMPACT_INPUT_LINE_HEIGHT;

type AterbyggarenPromptBoxProps = {
  attachments?: AterbyggarenPromptAttachment[];
  autoFocus?: boolean;
  bordered?: boolean;
  compact?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onPickFile?: () => void;
  onKeyPress?: TextInputProps["onKeyPress"];
  onRemoveAttachment?: (attachmentId: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  value: string;
};

type PromptSubmitKeyEvent = NativeSyntheticEvent<TextInputKeyPressEventData> & {
  getModifierState?: (key: string) => boolean;
  key?: string;
  nativeEvent: TextInputKeyPressEventData & {
    getModifierState?: (key: string) => boolean;
    isComposing?: boolean;
    keyCode?: number;
    shiftKey?: boolean;
  };
  shiftKey?: boolean;
};

const isPlainEnterKeyEvent = (event: PromptSubmitKeyEvent) => {
  const isShiftPressed =
    event.shiftKey ||
    event.nativeEvent.shiftKey ||
    event.getModifierState?.("Shift") ||
    event.nativeEvent.getModifierState?.("Shift") ||
    false;
  const isComposing =
    event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;

  return (
    (event.key ?? event.nativeEvent.key) === "Enter" &&
    !isShiftPressed &&
    !isComposing
  );
};

export const AterbyggarenPromptBox = React.forwardRef<
  TextInput,
  AterbyggarenPromptBoxProps
>(
  (
    {
      attachments = [],
      autoFocus = false,
      bordered = false,
      compact = false,
      disabled = false,
      loading = false,
      onChangeText,
      onPickFile,
      onKeyPress,
      onRemoveAttachment,
      onSubmit,
      placeholder = "Ställ din fråga här",
      style,
      value,
    },
    ref,
  ) => {
    const { isDesktop } = useScreenType();
    const previousLineCountRef = React.useRef(getExplicitLineCount(value));
    const [contentHeight, setContentHeight] = React.useState(
      MIN_COMPACT_INPUT_CONTENT_HEIGHT,
    );
    const hasAttachments = attachments.length > 0;
    const defaultInputHeight = isDesktop ? 123 : 162;
    const compactInputHeight = Math.min(Math.max(contentHeight, 24), 132);

    const handleSubmit = React.useCallback(() => {
      if (disabled || loading) return;

      onSubmit();
    }, [disabled, loading, onSubmit]);

    React.useEffect(() => {
      const lineCount = getExplicitLineCount(value);

      if (compact && lineCount < previousLineCountRef.current) {
        setContentHeight(getMinContentHeightForValue(value));
      }

      previousLineCountRef.current = lineCount;
    }, [compact, value]);

    const handleContentSizeChange = (
      event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
    ) => {
      setContentHeight(
        Math.max(
          event.nativeEvent.contentSize.height,
          getMinContentHeightForValue(value),
        ),
      );
    };

    const handleKeyPress = React.useCallback<
      NonNullable<TextInputProps["onKeyPress"]>
    >(
      (event) => {
        if (isPlainEnterKeyEvent(event as PromptSubmitKeyEvent)) {
          event.preventDefault();
          handleSubmit();
          return;
        }

        onKeyPress?.(event);
      },
      [handleSubmit, onKeyPress],
    );

    return (
      <View
        style={[
          {
            backgroundColor: primitives.neutrals100,
            borderColor: primitives.neutrals300,
            borderRadius: isDesktop ? 8 : 9,
            borderWidth: bordered ? 1 : 0,
            height: compact || hasAttachments ? undefined : defaultInputHeight,
            minHeight: compact ? (isDesktop ? 78 : 88) : defaultInputHeight,
            paddingBottom: compact ? 12 : isDesktop ? 12 : 14,
            paddingHorizontal: compact ? 12 : isDesktop ? 12 : 18,
            paddingTop: compact ? 12 : isDesktop ? 12 : 18,
            width: "100%",
          },
          style,
        ]}
      >
        <View
          style={{
            flex: compact ? undefined : 1,
            paddingVertical: compact ? COMPACT_INPUT_VERTICAL_PADDING : 0,
          }}
        >
          {attachments.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {attachments.map((attachment) => (
                <AttachmentChip
                  key={attachment.id}
                  attachment={attachment}
                  disabled={loading}
                  onRemove={onRemoveAttachment}
                />
              ))}
            </View>
          )}
          <TextInput
            ref={ref}
            autoFocus={autoFocus}
            blurOnSubmit
            editable={!loading}
            multiline
            onChangeText={onChangeText}
            onContentSizeChange={compact ? handleContentSizeChange : undefined}
            onKeyPress={Platform.OS === "web" ? handleKeyPress : onKeyPress}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor={primitives.neutrals800}
            value={value}
            style={{
              color: primitives.neutrals900,
              flex: compact ? undefined : 1,
              fontFamily: "Inter-Regular",
              fontSize: 14,
              height: compact ? compactInputHeight : undefined,
              lineHeight: COMPACT_INPUT_LINE_HEIGHT,
              maxHeight: compact ? 132 : undefined,
              outlineColor: "transparent",
              outlineWidth: 0,
              padding: 0,
              textAlignVertical: "top",
            }}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              gap: isDesktop ? 8 : 10,
            }}
          >
            <PromptIconButton
              disabled={loading}
              icon="paperclip"
              onPress={onPickFile}
            />
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

AterbyggarenPromptBox.displayName = "AterbyggarenPromptBox";

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

const AttachmentChip = ({
  attachment,
  disabled,
  onRemove,
}: {
  attachment: AterbyggarenPromptAttachment;
  disabled: boolean;
  onRemove?: (attachmentId: string) => void;
}) => {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: primitives.neutrals200,
        borderColor: primitives.neutrals300,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        maxWidth: 220,
        minHeight: 34,
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      {attachment.kind === "image" && (attachment.uri || attachment.url) ? (
        <ExpoImage
          source={{ uri: attachment.uri ?? attachment.url }}
          style={{ borderRadius: 5, height: 24, width: 24 }}
        />
      ) : (
        <Icon icon="paperclip" customColor={primitives.neutrals600} size={18} />
      )}
      <Text
        numberOfLines={1}
        style={{
          color: primitives.neutrals800,
          flexShrink: 1,
          fontFamily: "Inter-Regular",
          fontSize: 12,
          lineHeight: 16,
        }}
      >
        {attachment.name}
      </Text>
      {onRemove && (
        <Pressable
          accessibilityLabel={`Ta bort ${attachment.name}`}
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => onRemove(attachment.id)}
        >
          {({ hovered, pressed }) => (
            <View style={{ opacity: hovered || pressed ? 0.65 : 1 }}>
              <Text
                style={{
                  color: primitives.neutrals600,
                  fontFamily: "Inter-Regular",
                  fontSize: 16,
                  lineHeight: 16,
                }}
              >
                x
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
};

const PromptIconButton = ({
  disabled = false,
  icon,
  onPress,
}: {
  disabled?: boolean;
  icon: "paperclip";
  onPress?: () => void;
}) => {
  return (
    <Pressable
      accessibilityLabel="Bifoga fil"
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            alignItems: "center",
            height: 24,
            justifyContent: "center",
            opacity: disabled ? 0.45 : hovered || pressed ? 0.7 : 1,
            width: 24,
          }}
        >
          <Icon icon={icon} customColor={primitives.neutrals600} size={22} />
        </View>
      )}
    </Pressable>
  );
};
