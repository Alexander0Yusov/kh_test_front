import type { ReactNode } from "react";

interface FormFieldProps {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}

export function FormField({
  children,
  error,
  htmlFor,
  label,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="form-field">
      <label className="form-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="form-field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
