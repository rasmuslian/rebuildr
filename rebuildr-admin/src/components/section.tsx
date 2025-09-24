import React from "react";

type Props = {
  children: React.ReactNode;
};

const Section = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded bg-white p-4 shadow-md">
      {children}
    </div>
  );
};

export default Section;
