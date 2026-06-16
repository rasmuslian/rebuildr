import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { ProductFields } from "@components/upsert-product/types";
import { useEffect, useState } from "react";
import { View } from "react-native";

type Props = {
  product: ProductFields;
  titleError?: string;
  descriptionError?: string;
  onChangeTitle: (t: string) => void;
  onChangeDescription: (d: string) => void;
};

export const DescriptionSection = ({
  product,
  titleError,
  descriptionError,
  onChangeTitle: _onChangeTitle,
  onChangeDescription: _onChangeDescription,
}: Props) => {
  const [title, setTitle] = useState(product.title ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const onChangeTitle = (t: string) => {
    setTitle(t);
    _onChangeTitle(t);
  };
  const onChangeDescription = (d: string) => {
    setDescription(d);
    _onChangeDescription(d);
  };

  useEffect(() => {
    setTitle(product.title ?? "");
  }, [product.title]);
  useEffect(() => {
    setDescription(product.description ?? "");
  }, [product.description]);

  return (
    <View>
      <Display size="small" style={{ marginBottom: 24 }}>
        Beskriv din produkt
      </Display>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            value: title,
            onChangeText: onChangeTitle,
            heading: "Annonsrubrik*",
            error: titleError,
            placeholder: "Ange annonsrubrik",
          },
          {
            type: "text",
            value: description,
            onChangeText: (t) => onChangeDescription(t.slice(0, 5000)),
            heading: "Beskrivning*",
            multiline: true,
            placeholder:
              "Beskriv produkten tydligt och detaljerat för att ge bättre köparinformation och en smidigare process",
            style: { height: 172 },
            error: descriptionError,
          },
        ]}
      />
      <Body size="small" color="secondary" style={{ marginTop: 12 }}>
        {product.description?.length ?? 0} av 5000 tecken
      </Body>
    </View>
  );
};
