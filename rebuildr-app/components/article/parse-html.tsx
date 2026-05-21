import { useState } from "react";
import { Display, Body, Headline, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  DOMNode,
} from "html-react-parser";
import { Image, ImageLoadEventData } from "expo-image";

import CTABlock from "@components/article/cta-block";
import Accordion from "@components/article/accordion";
import LinkGroup from "@components/article/link-group";
import { Divider } from "@components/dividers/divider";
import { Linking, Pressable, View } from "react-native";
import { Icon } from "@icons/icon";

const isMeaningfulChild = (node: DOMNode) =>
  !(
    node.type === "text" &&
    ((node as unknown as { data?: string }).data ?? "").trim() === ""
  );

const findFirstImg = (children: DOMNode[]) =>
  children.find(
    (c) => c instanceof Element && (c as Element).name === "img",
  ) as Element | undefined;

const ArticleImage = ({ src, alt }: { src: string; alt?: string }) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  return (
    <Image
      cachePolicy="memory-disk"
      source={src}
      contentFit="contain"
      accessibilityLabel={alt}
      onLoad={(e: ImageLoadEventData) => {
        const w = e?.source?.width;
        const h = e?.source?.height;
        if (w && h) setAspectRatio(w / h);
      }}
      style={{
        width: "100%",
        aspectRatio: aspectRatio ?? 16 / 9,
        borderRadius: borderRadius.medium,
      }}
    />
  );
};

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
            const meaningful = (domNode.children as DOMNode[]).filter(
              isMeaningfulChild,
            );
            const isImgOnly =
              meaningful.length === 1 &&
              meaningful[0] instanceof Element &&
              (meaningful[0] as Element).name === "img";
            if (isImgOnly) {
              return <>{domToReact(domNode.children as DOMNode[], options)}</>;
            }
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
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {isOrdered ? (
                  <Body size="medium">{`${index + 1}.`}</Body>
                ) : (
                  <Icon icon="bullet" size={14} style={{ marginTop: 4 }} />
                )}
                <View style={{ flex: 1 }}>
                  <Body size="medium">
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
          case "figure": {
            const imgChild = findFirstImg(domNode.children as DOMNode[]);
            if (!imgChild) return <NotParsed />;
            return (
              <View style={{ marginBottom: 24 }}>
                <ArticleImage
                  src={imgChild.attribs.src}
                  alt={imgChild.attribs.alt}
                />
              </View>
            );
          }
          case "img": {
            return (
              <View style={{ marginBottom: 24 }}>
                <ArticleImage
                  src={domNode.attribs.src}
                  alt={domNode.attribs.alt}
                />
              </View>
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
