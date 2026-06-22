import {
  TextInput,
  TextInputProps,
  TextInputSubmitEditingEvent,
  View,
  ViewStyle,
} from "react-native";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { textStyles } from "@components/typography/typeface";
import { Pressable } from "react-native-gesture-handler";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchContext } from "@context/search-context";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { useFilterProduct } from "@hooks/useFilterProduct";

type Props = {
  visible?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
  borderStyle?: ViewStyle;
  searchOnSubmit?: boolean;
} & Omit<TextInputProps, "onChange" | "style">;

export const Search = ({
  visible = true,
  onChange,
  onFocus,
  disabled,
  style,
  backgroundColor,
  borderStyle,
  searchOnSubmit = false,
  ...rest
}: Props) => {
  const { filterBuilder } = useFilterProduct();
  const { searchState, setSearchState, search } = useSearchContext();
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const inputWrapperRef = useRef<View>(null);
  const textInputRef = useRef<TextInput>(null);
  const dropdownPositionRef = useRef(searchState.dropdownPosition);
  const [isDropdownAnchorActive, setIsDropdownAnchorActive] = useState(false);

  const inputBackgroundColor = searchState.dropdownVisible
    ? colors.background.neutral
    : backgroundColor || colors.background.secondary;
  const xBackgroundColor = searchState.dropdownVisible
    ? colors.background.neutral
    : backgroundColor || colors.buttons.iconQuickLink.hovered;

  const updateDropdownPosition = useCallback(
    (showDropdown = false) => {
      if (!isDesktop || !inputWrapperRef.current) return;

      inputWrapperRef.current.measure((x, y, width, height, pageX, pageY) => {
        const dropdownPosition = { x: pageX, y: pageY + height - 12, width };
        const previousDropdownPosition = dropdownPositionRef.current;
        const hasPositionChanged =
          previousDropdownPosition.x !== dropdownPosition.x ||
          previousDropdownPosition.y !== dropdownPosition.y ||
          previousDropdownPosition.width !== dropdownPosition.width;

        if (!hasPositionChanged && !showDropdown) return;

        dropdownPositionRef.current = dropdownPosition;
        setSearchState({
          dropdownPosition,
          ...(showDropdown ? { dropdownVisible: true } : {}),
        });
      });
    },
    [isDesktop, setSearchState],
  );

  const openDropdown = () => {
    if (isDesktop && inputWrapperRef.current) {
      setIsDropdownAnchorActive(true);
      updateDropdownPosition(true);
    }
  };

  useEffect(() => {
    if (!searchState.dropdownVisible) {
      setIsDropdownAnchorActive(false);
    }
  }, [searchState.dropdownVisible]);

  useEffect(() => {
    if (
      !isDesktop ||
      !visible ||
      !isDropdownAnchorActive ||
      !searchState.dropdownVisible
    ) {
      return;
    }

    let animationFrameId: number;

    const syncDropdownPosition = () => {
      updateDropdownPosition();
      animationFrameId = requestAnimationFrame(syncDropdownPosition);
    };

    animationFrameId = requestAnimationFrame(syncDropdownPosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isDesktop,
    isDropdownAnchorActive,
    searchState.dropdownVisible,
    updateDropdownPosition,
    visible,
  ]);

  const onChangeText = (text: string) => {
    setSearchState({ searchString: text });

    if (onChange) {
      onChange(text);
    } else {
      search(text);
    }
  };

  const onSubmit = (event: TextInputSubmitEditingEvent) => {
    const { text } = event.nativeEvent;

    filterBuilder.reset().setSearchString(text).apply();
    setSearchState({ dropdownVisible: false });
    router.navigate("/search/products");
  };

  return (
    <View
      ref={inputWrapperRef}
      style={[
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 10,
          backgroundColor: inputBackgroundColor,
          borderRadius: borderRadius.medium,
          ...borderStyle,
        },
        style,
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={{ marginRight: 8 }}>
        <Icon icon="search" size={18} />
      </View>
      <TextInput
        {...rest}
        ref={textInputRef}
        onChangeText={onChangeText}
        onFocus={onFocus ?? openDropdown}
        onSubmitEditing={searchOnSubmit ? onSubmit : undefined}
        placeholderTextColor={colors.text.secondary}
        value={searchState.searchString ?? ""}
        editable={!disabled && visible}
        style={{
          outlineStyle: "none",
          outlineWidth: 0,
          overflow: "visible",
          flexGrow: 1,
          ...textStyles.label.large,
          color: colors.text.primaryDark,
          lineHeight: undefined,
        }}
      />
      {(searchState.dropdownVisible || !!searchState.searchString?.length) && (
        <Pressable
          onPress={() => {
            onChangeText("");
            if (isDesktop) {
              setIsDropdownAnchorActive(false);
              setSearchState({ dropdownVisible: false });
            }
          }}
        >
          <View
            style={{
              marginLeft: 8,
              borderRadius: borderRadius.medium,
              backgroundColor: xBackgroundColor,
              padding: 2,
            }}
          >
            <Icon icon="X" size={18} />
          </View>
        </Pressable>
      )}
    </View>
  );
};
