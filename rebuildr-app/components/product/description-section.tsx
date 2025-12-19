import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { View } from "react-native";

type Props = {
  title: string;
  titleError?: string;
  description: string;
  descriptionError?: string;
  onChangeTitle: (t: string) => void;
  onChangeDescription: (d: string) => void;
};

export const DescriptionSection = ({
  title: _title,
  titleError,
  description: _description,
  descriptionError,
  onChangeTitle,
  onChangeDescription,
}: Props) => {
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
            value: _title,
            onChangeText: onChangeTitle,
            heading: "Annonsrubrik",
            error: titleError,
          },
          {
            type: "text",
            value: _description,
            onChangeText: (t) => onChangeDescription(t.slice(0, 5000)),
            heading: "Beskrivning",
            multiline: true,
            placeholder:
              "Beskriv produkten tydligt och detaljerat för att ge bättre köparinformation och en smidigare process",
            style: { height: 172 },
            error: descriptionError,
          },
        ]}
      />
      <Body size="small" color="secondary" style={{ marginTop: 12 }}>
        {_description.length} av 5000 tecken
      </Body>
    </View>
  );
};
