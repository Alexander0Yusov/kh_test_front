"use client";

import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, useState } from "react";

import { Input } from "@/shared/ui/input";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  ref?: React.Ref<HTMLInputElement>;
}

export function PasswordInput({ className, ref, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const classes = ["password-input-control", className].filter(Boolean).join(" ");

  return (
    <span className="password-input">
      <Input className={classes} ref={ref} type={visible ? "text" : "password"} {...props} />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="password-visibility"
        onClick={() => setVisible((value) => !value)}
        onMouseDown={(event) => event.preventDefault()}
        type="button"
      >
        {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
      </button>
    </span>
  );
}
