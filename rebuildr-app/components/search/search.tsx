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
import { useRef } from "react";
import { useSearchContext } from "@context/search-context";
import { useScreenType } from "@hooks/useScreenType";
import {
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
} from "@/gql/graphql";
import { useMutation } from "@apollo/client";
import { router } from "expo-router";
import { CREATE_SEARCH_RESULT } from "./queries";
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
  const filterContext = useFilterProduct();
  const { searchState, setSearchState, search } = useSearchContext();
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const inputWrapperRef = useRef<View>(null);
  const textInputRef = useRef<TextInput>(null);

  const [createSearchResult] = useMutation<
    CreateSearchResultMutation,
    CreateSearchResultMutationVariables
  >(CREATE_SEARCH_RESULT);

  const inputBackgroundColor = searchState.dropdownVisible
    ? colors.background.neutral
    : backgroundColor || colors.background.secondary;
  const xBackgroundColor = searchState.dropdownVisible
    ? colors.background.neutral
    : backgroundColor || colors.buttons.iconQuickLink.hovered;

  const openDropdown = () => {
    if (isDesktop && inputWrapperRef.current) {
      inputWrapperRef.current.measure((x, y, width, height, pageX, pageY) => {
        setSearchState({
          dropdownPosition: { x: pageX, y: pageY + height - 12, width },
          dropdownVisible: true,
        });
      });
    }
  };

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
    if (text) {
      createSearchResult({ variables: { input: { searchString: text } } });
    }

    filterContext.resetAndSetSearchString(text);
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
          outlineStyle: undefined,
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
