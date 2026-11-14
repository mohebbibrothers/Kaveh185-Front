import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-stage text-on-stage shadow-1 hover:bg-stage-2 active:translate-y-px",
  gold: "bg-gold text-on-gold shadow-1 hover:bg-gold-strong active:translate-y-px",
  ghost:
    "border border-border-strong bg-surface text-text hover:bg-surface-2 active:translate-y-px",
  quiet: "text-text-muted hover:bg-surface-2 hover:text-text",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-md gap-1.5",
  md: "h-11 px-5 text-[14.5px] rounded-md gap-2",
  lg: "h-[52px] px-7 text-[15.5px] rounded-lg gap-2.5",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-bold select-none",
        "ease-standard transition-[background-color,color,transform,box-shadow] duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
