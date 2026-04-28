import { StyleSheet, View } from "react-native";
import Markdown, { RenderRules } from "react-native-markdown-display";
import { Body } from "@components/typography/text";
import dayjs from "dayjs";

export const parseSystemMessagePreview = (text: string): string =>
  text
    .split("\n")
    .map((line) =>
      line
        .replace(/^# /, "")
        .replace(/_([^_]+)_/g, "$1")
        .replace(
          /\[([^\]]*)\]\(<date::([^:>]+)::([^>]+)>\)/g,
          (_, __, format, date) =>
            dayjs(decodeURI(date)).format(decodeURI(format)),
        )
        .replace(
          /\[([^\]]*)\]\(date::([^:)]+)::([^)]+)\)/g,
          (_, __, format, date) =>
            dayjs(decodeURI(date)).format(decodeURI(format)),
        )
        .replace(/\[([^\]]*)\]\(<[^>]+>\)/g, "$1")
        .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1"),
    )
    .join(" ")
    .trim();

type Props = {
  text: string;
  onAbortPurchase: () => void;
  onReport: () => void;
};
enum MessageLinkEnum {
  ABORT = "ABORT",
  REPORT = "REPORT",
}

export const SystemMessage = ({ text, onAbortPurchase, onReport }: Props) => {
  const rules: RenderRules = {
    //Used for normal text. Cant use 'body' or 'paragraph' since they will wrap the other rules and
    //then affect their line height
    heading1: (node, children) => {
      return (
        <Body key={node.key} size="large">
          {children}
        </Body>
      );
    },
    // use em rule to write smaller text. example: "_small text here_"
    em: (node, children) => {
      return (
        <Body key={node.key} size="small" style={{ lineHeight: 0 }}>
          {children}
        </Body>
      );
    },

    //Custom link rendering. Also utilize link to show date by writing for example: "[link](date:YYYY-MM-DD)"
    link: (node, children, parent) => {
      const childOfSmall = parent.some((p) => p.type === "em");
      if (node.attributes.href.startsWith("date:")) {
        const parts = node.attributes.href.split("::");
        const format = decodeURI(parts[1]);
        const date = decodeURI(parts[2]);
        const formattedDate = dayjs(date).format(format);
        return (
          <Body
            key={node.key}
            size={childOfSmall ? "small" : "large"}
            style={{ lineHeight: 0 }}
          >
            {formattedDate}
          </Body>
        );
      } else {
        switch (node.attributes.href) {
          case MessageLinkEnum.ABORT:
            return (
              <Body
                onPress={onAbortPurchase}
                key={node.key}
                size={childOfSmall ? "small" : "large"}
              >
                {children}
              </Body>
            );
          case MessageLinkEnum.REPORT:
            return (
              <Body
                onPress={onReport}
                key={node.key}
                isLink
                size={childOfSmall ? "small" : "large"}
              >
                {children}
              </Body>
            );
          default:
            //No valid link enum
            return null;
        }
      }
    },
  };
  //Null all styles since we want to controll it ourselves
  const styles: StyleSheet.NamedStyles<any> = {
    heading1: {},
    link: {},
    span: {},
    em: {},
  };

  //Split and render each section to handle line breaks
  const sections = text.split("\n");
  return (
    <View style={{ gap: 8 }}>
      {sections.map((section, i) => (
        <Markdown rules={rules} style={styles} mergeStyle={false} key={i}>
          {section}
        </Markdown>
      ))}
    </View>
  );
};
