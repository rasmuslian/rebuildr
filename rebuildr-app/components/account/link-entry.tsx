import { Body, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { Href, Link } from "expo-router";
import { View } from "react-native";

type Props = {
  label: string;
  body: string;
  link: Href;
};

export const LinkEntry = ({ label, body, link }: Props) => {
  return (
    <Link href={link} asChild>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 2, flex: 1 }}>
          <Label size="large">{label}</Label>
          <Body size="small">{body}</Body>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            borderRadius: borderRadius.medium,
            minWidth: 40,
            height: 40,
          }}
        >
          <Icon icon="arrowRight" color="primaryDark" size={18} />
        </View>
      </View>
    </Link>
  );
};
