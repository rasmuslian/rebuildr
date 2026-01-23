import { Form } from "@components/forms/form";
import { Body } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  additionalInfo: string;
  onChange: (d: string) => void;
};

export const AdditionalInfoSection = ({
  additionalInfo: _additionalInfo,
  onChange,
}: Props) => {
  const [additionalInfo, setAdditionalInfo] = useState(_additionalInfo);

  const maxChars = 2000;

  const onChangeAdditionalInfo = (s: string) => {
    setAdditionalInfo(s);
    onChange(s);
  };

  return (
    <View>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            value: additionalInfo,
            onChangeText: (t) => onChangeAdditionalInfo(t.slice(0, maxChars)),
            heading: "Bra att veta",
            multiline: true,
            placeholder:
              "Här kan du ange sådant som kan vara bra för köparen att känna till, t.ex. skador, defekter, saknade delar eller annat relevant.",
            style: { height: 92 },
          },
        ]}
      />
      <Body size="small" color="secondary" style={{ marginTop: 12 }}>
        {_additionalInfo.length} av {maxChars} tecken
      </Body>
    </View>
  );
};
