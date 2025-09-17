import React, {
  useState,
  ReactElement,
  useRef,
  useEffect,
  PropsWithChildren,
} from "react";

import { DownOutlined } from "@ant-design/icons";
import { Button } from "antd";
import cn from "classnames";

const Accordion = ({ children }: PropsWithChildren) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isExpanded, children]);

  const childrenArray = React.Children.toArray(children) as ReactElement[];

  const summaryElement = childrenArray.find(
    (child) => child.type === "summary",
  );

  const contentElements = childrenArray.filter(
    (child) => child.type !== "summary",
  );

  return (
    <div className="flex list-none flex-col">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-headline-small">{summaryElement}</h2>
        <Button
          type="text"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={
            <DownOutlined
              className={cn("transition duration-500 ease-in-out", {
                "rotate-180": isExpanded,
              })}
            />
          }
        />
      </div>
      <div
        ref={contentRef}
        style={{
          height: `${height}px`,
          transition: "height 0.5s ease-in-out",
          overflow: "hidden",
        }}
      >
        <div className="mb-6 mt-3 flex flex-col gap-3">{contentElements}</div>
      </div>
    </div>
  );
};

export default Accordion;
