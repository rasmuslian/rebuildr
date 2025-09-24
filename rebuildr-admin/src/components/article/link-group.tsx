import React, { PropsWithChildren, ReactElement } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";

const LinkGroup = ({ children }: PropsWithChildren) => {
  const childrenArray = React.Children.toArray(children) as ReactElement[];
  const listItems = childrenArray.filter((child) => child.type == "li");

  return (
    <div className="flex list-none flex-col gap-4">
      {listItems.map((listItem, index) => {
        const liChildren = React.Children.toArray(
          listItem.props.children,
        ) as ReactElement[];

        const label = liChildren.find((c) => c.type === "label") as
          | ReactElement
          | undefined;

        const paragraph = liChildren.find((c) => c.type === "p") as
          | ReactElement
          | undefined;

        const button = liChildren.find((c) => c.type === "button") as
          | ReactElement
          | undefined;

        const buttonLink = button?.props["data-link"];

        return (
          <div key={index} className="grid grid-cols-[auto_40px] gap-4">
            <div className="flex flex-col">
              {label && (
                <label className="text-label-large">
                  {label.props.children}
                </label>
              )}

              {paragraph && (
                <p className="text-body-small">{paragraph.props.children}</p>
              )}
            </div>

            {button && buttonLink && (
              <Button
                icon={<ArrowRightOutlined />}
                type="text"
                onClick={() => window.open(buttonLink, "_blank")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LinkGroup;
