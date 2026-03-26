import React from "react";
import { Divider } from "antd";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  DOMNode,
} from "html-react-parser";
import { isEmpty } from "lodash";
import EmptyContainer from "@components/empty-container";

import Accordion from "@components/article/accordion";
import LinkGroup from "@components/article/link-group";
import CTABlock from "@components/article/cta-block";
import Image from "next/image";
import { colors } from "tailwind.config";

type Props = {
  html: string;
};

const NotParsed = () => (
  <p className="text-semantic_error_500">Not parsed ...</p>
);

const parseHtml = (html: string) => {
  const cleanedHtml = html.replace(/\n/g, "");

  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "h1": {
            return (
              <h1 className="mb-6 text-display-small">
                {domToReact(domNode.children as DOMNode[])}
              </h1>
            );
          }
          case "h2": {
            return (
              <h2 className="mb-3 text-headline-small">
                {domToReact(domNode.children as DOMNode[])}
              </h2>
            );
          }
          case "h3": {
            return (
              <h3 className="mb-3 text-headline-small">
                {domToReact(domNode.children as DOMNode[])}
              </h3>
            );
          }
          case "h4": {
            return (
              <h4 className="mb-3 text-headline-small">
                {domToReact(domNode.children as DOMNode[])}
              </h4>
            );
          }
          case "p": {
            return (
              <p className="mb-6 text-body-medium">
                {domToReact(domNode.children as DOMNode[], options)}
              </p>
            );
          }
          case "strong": {
            return (
              <strong className="font-bold">
                {domToReact(domNode.children as DOMNode[], options)}
              </strong>
            );
          }
          case "li": {
            return (
              <li className="mb-2">
                {domToReact(domNode.children as DOMNode[], options)}
              </li>
            );
          }
          case "a": {
            return (
              <a
                className="mb-6 text-body-medium text-accent_500 underline hover:text-accent_500 hover:underline"
                href={domNode.attribs.href}
                target={domNode.attribs.target}
              >
                {domToReact(domNode.children as DOMNode[], options)}
              </a>
            );
          }
          case "img": {
            return (
              <Image
                alt=""
                src={domNode.attribs.src}
                width={400}
                height={400}
                style={{
                  aspectRatio: 1,
                  borderRadius: 12,
                }}
              />
            );
          }
          case "summary": {
            return (
              <h2 className="mr-4 text-headline-small">
                {domToReact(domNode.children as DOMNode[])}
              </h2>
            );
          }
          case "details": {
            return (
              <Accordion>
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
                <Divider
                  style={{
                    marginTop: 0,
                    marginBottom: 24,
                    backgroundColor: colors.neutrals_300,
                    height: 1,
                  }}
                />
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
                <ul className="mb-6 list-disc pl-6">
                  {domToReact(domNode.children as DOMNode[], options)}
                </ul>
              );
            }
          }
          case "ol":
            return (
              <ol className="mb-6 list-decimal pl-6">
                {domToReact(domNode.children as DOMNode[], options)}
              </ol>
            );
          default: {
            return <NotParsed />;
          }
        }
      }
    },
  };

  return parse(cleanedHtml, options);
};

const HtmlPreview = ({ html }: Props) => {
  return (
    <div className="flex flex-1 flex-col rounded bg-white p-4 shadow-md">
      <Divider>Förhandsvisning</Divider>

      {isEmpty(html) ? (
        <EmptyContainer description="Tom artikel" />
      ) : (
        parseHtml(html)
      )}
    </div>
  );
};

export default HtmlPreview;
