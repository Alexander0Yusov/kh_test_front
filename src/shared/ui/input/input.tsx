import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ className, ref, ...props }: InputProps) {
  const classes = ["ui-input", className].filter(Boolean).join(" ");

  return <input className={classes} ref={ref} {...props} />;
}
