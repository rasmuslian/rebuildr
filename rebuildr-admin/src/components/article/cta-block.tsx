import { Button } from "antd";
import React, { PropsWithChildren, ReactElement } from "react";

const CTABlock = ({ children }: PropsWithChildren) => {
  const childrenArray = React.Children.toArray(children) as ReactElement[];

  const title = childrenArray.find((c) => c.type === "h2") as
    | ReactElement
    | undefined;

  const description = childrenArray.find((c) => c.type === "p") as
    | ReactElement
    | undefined;

  const button = childrenArray.find((c) => c.type === "button") as
    | ReactElement
    | undefined;

  const buttonLabel = button?.props.children;
  const buttonLink = button?.props["data-link"];

  return (
    <div className="rounded-[12px] bg-secondary_200 p-4 text-center">
      {title && (
        <h2 className="text-headline-small mb-4">{title.props.children}</h2>
      )}
      {description && (
        <p className="text-body-medium mb-6">{description.props.children}</p>
      )}

      {buttonLabel && buttonLink && (
        <Button
          onClick={() => window.open(buttonLink, "_blank")}
          type="primary"
          block
        >
          <span className="text-label-large">{button.props.children}</span>
        </Button>
      )}
    </div>
  );
};

export default CTABlock;
