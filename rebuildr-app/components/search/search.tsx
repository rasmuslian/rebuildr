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
import { useContext, useEffect, useRef, useState } from "react";
import { SearchDropdownContext } from "@context/search-dropdown-context";
import { useScreenType } from "@hooks/useScreenType";
import {
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
  DoSearchQuery,
  DoSearchQueryVariables,
} from "@/gql/graphql";
import { CREATE_SEARCH_RESULT, DO_SEARCH } from "@/app/(app)/(tabs)/search";
import { useLazyQuery, useMutation } from "@apollo/client";
import { router } from "expo-router";
import { useDebounce } from "@hooks/use-debounce";

type Props = {
  visible?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
  borderStyle?: ViewStyle;
  searchOnSubmit?: boolean;
} & Omit<TextInputProps, "onChange" | "style">;

export const Search = ({
  visible = true,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  disabled,
  defaultValue,
  style,
  backgroundColor,
  borderStyle,
  searchOnSubmit = false,
  ...rest
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const inputWrapperRef = useRef<View>(null);
  const textInputRef = useRef<TextInput>(null);
  const [value, setValue] = useState<string>("");
  const {
    visible: dropdownVisible,
    setVisible: setShowDropdown,
    setPosition,
    setSearchData,
    setSearchString,
  } = useContext(SearchDropdownContext);

  const handleSearch = (text: string) => {
    setSearchString(text);
    if (onChange) {
      onChange?.(text);
      return;
    }

    if (isDesktop && text.length > 0) {
      search({
        variables: {
          searchResultsInput: { searchString: text },
          usersInput: { name: text },
        },
      });
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 200);

  const [search, { data: searchData }] = useLazyQuery<
    DoSearchQuery,
    DoSearchQueryVariables
  >(DO_SEARCH);

  const [createSearchResult] = useMutation<
    CreateSearchResultMutation,
    CreateSearchResultMutationVariables
  >(CREATE_SEARCH_RESULT);

  useEffect(() => {
    if (!visible) {
      setShowDropdown(false);
      handleChange("");
      textInputRef.current?.blur();
    }
  }, [visible]);

  useEffect(() => {
    if (searchData === undefined) {
      return;
    }
    setSearchData(searchData);
  }, [searchData]);

  const inputBackgroundColor = dropdownVisible
    ? colors.background.neutral
    : backgroundColor || colors.background.secondary;

  const openDropdown = () => {
    if (!isDesktop) {
      return;
    }
    if (inputWrapperRef.current) {
      inputWrapperRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({ x: pageX, y: pageY + height - 12, width });
      });
      setTimeout(() => {
        setShowDropdown(true);
      }, 10);
    }
  };

  const closeDropdown = () => {
    if (!isDesktop) {
      return;
    }
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  const handleChange = (text: string) => {
    setValue(text);
    debouncedSearch(text);
  };

  const onSubmit = (event: TextInputSubmitEditingEvent) => {
    const { text } = event.nativeEvent;
    if (text) {
      createSearchResult({ variables: { input: { searchString: text } } });
    }
    router.navigate({
      pathname: "/search/products",
      params: { searchString: text },
    });
    setShowDropdown(false);
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
        onChangeText={handleChange}
        onFocus={onFocus ?? openDropdown}
        onBlur={onBlur ?? closeDropdown}
        onSubmitEditing={searchOnSubmit ? onSubmit : undefined}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={value}
        editable={!disabled && visible}
        defaultValue={defaultValue}
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
      {!!dropdownVisible && (
        <Pressable
          onPress={() => {
            handleChange("");
            closeDropdown();
          }}
        >
          <View style={{ marginLeft: 8 }}>
            <Icon icon="X" size={18} />
          </View>
        </Pressable>
      )}
    </View>
  );
};
