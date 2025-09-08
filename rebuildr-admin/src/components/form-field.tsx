import React from "react";

type Props = {
  label?: string;
  error?: string;
  children?: React.ReactNode;
};

const FormField = ({ label, error, children }: Props) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && <label className="text-text_secondary text-sm">{label}</label>}

      {children}

      {error && <p className="mx-3 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
