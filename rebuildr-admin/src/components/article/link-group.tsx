import React, { PropsWithChildren, ReactElement } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
  "data-link"?: string;
}

const LinkGroup = ({ children }: PropsWithChildren) => {
  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const listItems = childrenArray.filter((child) => child.type === "li");

  return (
    <div className="mb-6 flex list-none flex-col gap-4">
      {listItems.map((listItem, index) => {
        const listItemChildren = React.Children.toArray(
          listItem.props.children,
        ).filter((c): c is ReactElement<ParsedHTMLElementProps> =>
          React.isValidElement(c),
        );

        const label = listItemChildren.find((c) => c.type === "label")?.props
          .children;

        const paragraph = listItemChildren.find((c) => c.type === "p")?.props
          .children;

        const link = listItemChildren.find((c) => c.type === "button")?.props[
          "data-link"
        ];

        return (
          <div key={index} className="grid grid-cols-[auto_40px]">
            <div className="flex flex-col">
              <label className="text-label-large">{label}</label>
              <p className="text-body-small">{paragraph}</p>
            </div>

            <Button
              icon={<ArrowRightOutlined />}
              type="text"
              onClick={() => window.open(link, "_blank")}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LinkGroup;
