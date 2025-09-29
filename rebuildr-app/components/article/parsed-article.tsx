import { Display, Body, Headline } from "@components/typography/text";
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

type Props = {
  html?: string;
};

const NotParsed = () => <Body size="small" />;

export default function ParsedArticle({ html }: Props) {
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
          case "p": {
            return (
              <Body size="medium" style={{ marginBottom: 24 }}>
                {domToReact(domNode.children as DOMNode[], options)}
              </Body>
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
            return <NotParsed />;
          }
          case "ul": {
            if (domNode.attribs?.class?.includes("link-group")) {
              return (
                <LinkGroup>
                  {domToReact(domNode.children as DOMNode[])}
                </LinkGroup>
              );
            }
            return <NotParsed />;
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
