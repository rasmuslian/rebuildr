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

interface ParsedHTMLElementProps {
  children?: React.ReactNode;
}

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

  const childrenArray = React.Children.toArray(children).filter(
    (c): c is ReactElement<ParsedHTMLElementProps> => React.isValidElement(c),
  );

  const summary = childrenArray[0];
  const content = childrenArray.slice(1);

  return (
    <div className="mb-6 flex list-none flex-col">
      <div className="flex flex-row justify-between align-middle">
        {summary}
        <Button
          type="text"
          onClick={() => setIsExpanded(!isExpanded)}
          size="middle"
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
        <div className="mt-3 flex flex-col">{content}</div>
      </div>
    </div>
  );
};

export default Accordion;
