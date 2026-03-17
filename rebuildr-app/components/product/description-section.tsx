import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { useEffect, useState } from "react";
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
  onChangeTitle: _onChangeTitle,
  onChangeDescription: _onChangeDescription,
}: Props) => {
  const [title, setTitle] = useState(_title);
  const [description, setDescription] = useState(_description);
  const onChangeTitle = (t: string) => {
    setTitle(t);
    _onChangeTitle(t);
  };
  const onChangeDescription = (d: string) => {
    setDescription(d);
    _onChangeDescription(d);
  };

  useEffect(() => {
    setTitle(_title);
  }, [_title]);
  useEffect(() => {
    setDescription(_description);
  }, [_description]);

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
            onChangeText: onChangeTitle,
            heading: "Annonsrubrik",
            error: titleError,
          },
          {
            type: "text",
            value: description,
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
