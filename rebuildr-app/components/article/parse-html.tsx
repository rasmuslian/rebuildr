import { Display, Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  DOMNode,
} from "html-react-parser";
import { Image } from "expo-image";

import CTABlock from "@components/article/cta-block";
import Accordion from "@components/article/accordion";
import LinkGroup from "@components/article/link-group";
import { Divider } from "@components/dividers/divider";
import { Linking, Pressable, View } from "react-native";
import { Icon } from "@icons/icon";

type Props = {
  html?: string;
};

const NotParsed = () => <Body size="small" />;

export default function ParseHtml({ html }: Props) {
  if (!html) return null;
  const cleanedHtml = html.replace(/\n/g, "");

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "h1": {
            return (
              <Display size="small" style={{ marginBottom: 24 }}>
                {domToReact(domNode.children as DOMNode[])}
              </Display>
            );
          }
          case "h2": {
            return (
              <Headline size="small" style={{ marginBottom: 12 }}>
                {domToReact(domNode.children as DOMNode[])}
              </Headline>
            );
          }
          case "h3": {
            return (
              <Headline size="small" style={{ marginBottom: 12 }}>
                {domToReact(domNode.children as DOMNode[])}
              </Headline>
            );
          }
          case "h4": {
            return (
              <Headline size="small" style={{ marginBottom: 12 }}>
                {domToReact(domNode.children as DOMNode[])}
              </Headline>
            );
          }
          case "p": {
            return (
              <Body size="medium" style={{ marginBottom: 24 }}>
                {domToReact(domNode.children as DOMNode[], options)}
              </Body>
            );
          }
          case "strong": {
            return (
              <Label>
                {domToReact(domNode.children as DOMNode[], options)}
              </Label>
            );
          }
          case "li": {
            const isOrdered = (domNode.parent as Element)?.name === "ol";
            const index = isOrdered
              ? (domNode.parent as Element).children
                  .filter((c) => c instanceof Element && c.name === "li")
                  .indexOf(domNode)
              : -1;

            return (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {isOrdered ? (
                  <Body size="medium">{`${index + 1}.`}</Body>
                ) : (
                  <Icon icon="bullet" size={14} />
                )}
                <View style={{ flex: 1 }}>
                  <Body size="medium" style={{ marginBottom: 16 }}>
                    {domToReact(domNode.children as DOMNode[], options)}
                  </Body>
                </View>
              </View>
            );
          }
          case "a": {
            return (
              <Pressable onPress={() => Linking.openURL(domNode.attribs.href)}>
                <Body size="medium" isLink>
                  {domToReact(domNode.children as DOMNode[], options)}
                </Body>
              </Pressable>
            );
          }
          case "img": {
            return (
              <Image
                cachePolicy="memory-disk"
                source={domNode.attribs.src}
                style={{
                  aspectRatio: 1,
                  borderRadius: borderRadius.medium,
                  width: "100%",
                }}
              />
            );
          }
          case "summary": {
            return (
              <Headline
                style={{ marginRight: 16 }}
                size="small"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {domToReact(domNode.children as DOMNode[])}
              </Headline>
            );
          }
          case "details": {
            return (
              <Accordion isOpen={domNode.attribs.open === "open"}>
                {domToReact(domNode.children as DOMNode[], options)}
              </Accordion>
            );
          }
          case "div": {
            if (domNode.attribs?.class?.includes("cta-block")) {
              return (
                <CTABlock>{domToReact(domNode.children as DOMNode[])}</CTABlock>
              );
            }
            if (domNode.attribs?.class?.includes("divider")) {
              return (
                <View style={{ marginBottom: 24 }}>
                  <Divider />
                </View>
              );
            }
            return <NotParsed />;
          }
          case "ul": {
            if (domNode.attribs?.class?.includes("link-group")) {
              return (
                <LinkGroup>
                  {domToReact(domNode.children as DOMNode[])}
                </LinkGroup>
              );
            } else {
              return (
                <View>
                  {domToReact(domNode.children as DOMNode[], options)}
                </View>
              );
            }
          }
          case "ol": {
            return (
              <View style={{ marginBottom: 24 }}>
                {domToReact(domNode.children as DOMNode[], options)}
              </View>
            );
          }
          default: {
            return <NotParsed />;
          }
        }
      }
    },
  };

  return parse(cleanedHtml, options);
}
