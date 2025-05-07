import { useState } from "react";
import { TextInput, Props as TextInputProps } from "./textInput";

export type Props = {} & Omit<TextInputProps, "trailing" | "hideText">;

export const MaskedInput = (props: Props) => {
  const [hideText, setHideText] = useState(true);

  return (
    <TextInput
      trailing={{
        icon: hideText ? "eye" : "eyeOff",
        onPress: () => setHideText(!hideText),
      }}
      hideText={hideText}
      {...props}
    />
  );
};
