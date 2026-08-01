import type {
  ButtonHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  children,
  className,
  ref,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = ["ui-button", className].filter(Boolean).join(" ");

  return (
    <button className={classes} ref={ref} type={type} {...props}>
      {children}
    </button>
  );
}
