import { Button } from "antd";
import React, { PropsWithChildren, ReactElement } from "react";

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
  [key: string]: any;
}

const CTABlock = ({ children }: PropsWithChildren) => {
  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const title = childrenArray.find((c) => c.type === "h2")?.props.children;
  const description = childrenArray.find((c) => c.type === "p")?.props.children;

  const button = childrenArray.find((c) => c.type === "button");
  const buttonLabel = button?.props.children?.toString();
  const buttonLink = button?.props["data-link"];

  return (
    <div className="mb-6 flex flex-col gap-6 rounded-[12px] bg-secondary_200 p-4 text-center">
      <div className="flex flex-col gap-4">
        <h2 className="text-headline-small">{title}</h2>
        <p className="text-body-medium">{description}</p>
      </div>

      <Button
        onClick={() => window.open(buttonLink, "_blank")}
        type="primary"
        block
      >
        <span className="text-label-large">{buttonLabel}</span>
      </Button>
    </div>
  );
};

export default CTABlock;
