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
import { colors } from "tailwind.config";

const isMeaningfulChild = (node: DOMNode) =>
  !(
    node.type === "text" &&
    ((node as unknown as { data?: string }).data ?? "").trim() === ""
  );

const findFirstImg = (children: DOMNode[]) =>
  children.find(
    (c) => c instanceof Element && (c as Element).name === "img",
  ) as Element | undefined;

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
          case "figure": {
            const imgChild = findFirstImg(domNode.children as DOMNode[]);
            if (!imgChild) return <NotParsed />;
            return (
              <figure className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={imgChild.attribs.alt ?? ""}
                  src={imgChild.attribs.src}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: 12,
                  }}
                />
              </figure>
            );
          }
          case "img": {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={domNode.attribs.alt ?? ""}
                src={domNode.attribs.src}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 12,
                  marginBottom: 24,
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
