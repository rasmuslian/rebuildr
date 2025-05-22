import { Body } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  text: string;
  nrOfLines?: number;
};

export const CollapsableText = ({ text, nrOfLines = 7 }: Props) => {
  const [showAll, setShowAll] = useState(false);

  //just a guess that each line of text will be 50 chars long
  const breakpoint = nrOfLines * 50;

  return (
    <View style={{ gap: 16 }}>
      <Body
        size="medium"
        numberOfLines={showAll ? undefined : nrOfLines}
        ellipsizeMode="tail"
      >
        {text}
      </Body>
      {text.length > breakpoint && (
        <Pressable onPress={() => setShowAll(!showAll)}>
          <Body size="medium" isLink>
            {showAll ? "Läs mindre" : "Läs hela beskrivningen"}
          </Body>
        </Pressable>
      )}
    </View>
  );
};
