import React from "react";
import classNames from "classnames";

type Props = {
  children: React.ReactNode;
  error?: string;
};

const Section = ({ children, error }: Props) => {
  return (
    <div
      className={classNames(
        "flex flex-col gap-4 rounded bg-white p-4 shadow-md",
        { "border border-semantic_error_600": !!error },
      )}
    >
      {error && (
        <p className="text-label-large text-semantic_error_600">{error}</p>
      )}

      {children}
    </div>
  );
};

export default Section;
