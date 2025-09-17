import React from "react";
import { Divider } from "antd";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  DOMNode,
} from "html-react-parser";
import Section from "@components/section";
import { isEmpty } from "lodash";
import EmptyContainer from "@components/empty-container";

import Accordion from "@components/article/accordion";
import LinkGroup from "@components/article/link-group";
import CTABlock from "@components/article/cta-block";

type Props = {
  html: string;
};

const parseHtml = (html: string) => {
  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === "details") {
        return (
          <Accordion>{domToReact(domNode.children as DOMNode[])}</Accordion>
        );
      }

      if (
        domNode instanceof Element &&
        domNode.name === "ul" &&
        domNode.attribs?.class?.includes("link-group")
      ) {
        return (
          <LinkGroup>{domToReact(domNode.children as DOMNode[])}</LinkGroup>
        );
      }

      if (
        domNode instanceof Element &&
        domNode.name === "div" &&
        domNode.attribs?.class?.includes("cta-block")
      ) {
        return <CTABlock>{domToReact(domNode.children as DOMNode[])}</CTABlock>;
      }
    },
  };

  return parse(html, options);
};

const ArticlePreview = ({ html }: Props) => {
  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <Divider orientation="left">Förhandsvisning</Divider>
      <Section>
        {isEmpty(html) ? (
          <EmptyContainer description="Tom artikel" />
        ) : (
          parseHtml(html)
        )}
      </Section>
    </div>
  );
};

export default ArticlePreview;
