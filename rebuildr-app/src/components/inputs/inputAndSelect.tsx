import React, { ReactElement, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Colors from "src/styles/colors";
import { Icon } from "../icons/icon";
import { InputText } from "../texts/text";
import { textStyles } from "../texts/textStyles";
import { BaseInputProps } from "./baseInput";
import { useOutsidePress } from "src/hooks/useOutsidePress";

type InputAndSelectProps<T extends string | number> = {
  label?: string;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  selectedValue?: T;
  selectPlaceHolder?: ReactElement;
} & BaseInputProps;

export const InputAndSelect = <T extends string | number>({
  onChange,
  placeholder,
  value,
  disabled,
  label,
  options,
  onSelect,
  selectedValue,
  selectPlaceHolder,
  ...props
}: InputAndSelectProps<T>) => {
  const [inputFocused, setInputFocused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionHover, setOptionHover] = useState<number | undefined>();
  const ref = useRef();
  useOutsidePress(ref, () => {
    setInputFocused(false);
    setShowOptions(false);
  });

  const onPressOption = (optionIndex: number) => {
    setInputFocused(false);
    setShowOptions(false);
    onSelect(options[optionIndex].value);
  };

  const selectLabel = () => {
    const selectedOptionLabel = options.find(
      (option) => option.value === selectedValue,
    )?.label;
    if (selectedOptionLabel) {
      return (
        <InputText type="default" color="pale" style={styles.selectedOption}>
          {selectedOptionLabel}
        </InputText>
      );
    }

    if (selectPlaceHolder) {
      return <View style={styles.selectedOption}>{selectPlaceHolder}</View>;
    }

    return (
      <InputText type="default" color="pale" style={styles.selectedOption}>
        Välj
      </InputText>
    );
  };

  return (
    <View style={[styles.container, props.style]}>
      {label && (
        <InputText style={styles.label} type="label">
          {label}
        </InputText>
      )}
      <View ref={ref}>
        <View
          style={[
            styles.inputContainer,
            inputFocused && {
              borderColor: Colors.blue,
              borderWidth: 2,
              padding: 0.25,
            },
          ]}
        >
          <TextInput
            {...props}
            style={[styles.input, textStyles.input.default]}
            onChangeText={onChange}
            placeholder={placeholder}
            value={value}
            readOnly={disabled}
            selectTextOnFocus={!disabled}
            onFocus={() => {
              setInputFocused(true);
              setShowOptions(false);
            }}
            onBlur={() => setInputFocused(false)}
          />
          <Pressable
            onPress={() => {
              setShowOptions(!showOptions);
              setInputFocused(!showOptions);
            }}
          >
            <View style={styles.selectContainer}>
              <View style={styles.separator} />
              {selectLabel()}
              <Icon iconType="DownChevron" />
            </View>
          </Pressable>
        </View>
        {showOptions && (
          <View style={{ position: "relative" }}>
            <View style={styles.optionsContainer}>
              {options.map((option, i) => (
                <Pressable
                  onHoverIn={() => setOptionHover(i)}
                  onPress={() => onPressOption(i)}
                  key={i}
                >
                  <View
                    style={[
                      styles.option,
                      i === options.length - 1 && { borderWidth: 0 },
                    ]}
                  >
                    <InputText
                      type="select"
                      color={i === optionHover ? undefined : "pale"}
                    >
                      {option.label}
                    </InputText>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  inputContainer: {
    minWidth: 300,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
  },
  label: {
    marginBottom: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    outlineStyle: "none",
  },
  selectContainer: {
    borderColor: Colors.borderGray,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingRight: 10,
  },
  separator: {
    borderStyle: "solid",
    borderWidth: 0.5,
    height: "100%",
    borderColor: Colors.borderGray,
    marginRight: 16,
  },
  selectedOption: {
    marginRight: 18,
  },
  optionsContainer: {
    backgroundColor: Colors.pale,
    alignSelf: "flex-end",
    width: 161,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    position: "absolute",
    top: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
  },
  option: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
  },
});
