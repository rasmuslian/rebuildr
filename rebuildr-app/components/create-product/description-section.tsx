import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  title: string;
  description: string;
  onBlurTitle: (t: string) => void;
  onBlurDescription: (d: string) => void;
};

export const DescriptionSection = ({
  title: _title,
  description: _description,
  onBlurTitle,
  onBlurDescription,
}: Props) => {
  const [title, setTitle] = useState(_title);
  const [description, setDescription] = useState(_description);

  return (
    <View>
      <Display size="small" style={{ marginBottom: 16 }}>
        Beskriv din produkt
      </Display>
      <Body size="large" style={{ marginBottom: 24 }}>
        Behöver du hjälp att skriva en säljande annons?{" "}
        <Body isLink>Läs vår guide här.</Body>
      </Body>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            value: title,
            onBlur: () => onBlurTitle(title),
            onChangeText: (t) => setTitle(t),
            heading: "Annonsrubrik",
          },
          {
            type: "text",
            value: description,
            onBlur: () => onBlurDescription(description),
            onChangeText: (t) => setDescription(t.slice(0, 5000)),
            heading: "Beskrivning",
            multiline: true,
            placeholder:
              "Beskriv produkten tydligt och detaljerat för att ge bättre köparinformation och en smidigare process",
            style: { minHeight: 172 },
          },
        ]}
      />
      <Body size="small" color="secondary" style={{ marginTop: 12 }}>
        {description.length} av 5000 tecken
      </Body>
    </View>
  );
};
