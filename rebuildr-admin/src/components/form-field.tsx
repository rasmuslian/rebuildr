import React from "react";

type Props = {
  required?: boolean;
  label?: string;
  error?: string;
  children?: React.ReactNode;
};

const FormField = ({ required = false, label, error, children }: Props) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label className="text-label-large">
          {label}
          {required && <span className="text-semantic_error_500"> * </span>}
        </label>
      )}

      {children}

      {error && (
        <p className="mx-3 text-label-medium text-semantic_error_600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
