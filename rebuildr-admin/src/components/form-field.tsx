import React from "react";

type Props = {
  label?: string;
  error?: string;
  children?: React.ReactNode;
};

const FormField = ({ label, error, children }: Props) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && <label className="text-label-large">{label}</label>}

      {children}

      {error && (
        <p className="text-label-medium mx-3 text-semantic_error_600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
