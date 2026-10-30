import * as React from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { XIcon } from "lucide-react";

import { cn } from "@/common/lib/cn";

export const inputClassName =
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-ring/22 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-text [&::-webkit-search-cancel-button]:appearance-none";

export function Input({
  className,
  icon,
  clearLabel,
  type,
  placeholder,
  ...props
}: Input.Props) {
  const clearable = type === "search" && !!clearLabel;
  const input = (
    <InputPrimitive
      data-slot="input"
      type={type}
      // The clear button hides itself with `peer-placeholder-shown`, which
      // only matches when the input has a placeholder.
      placeholder={clearable ? placeholder || " " : placeholder}
      className={cn(
        inputClassName,
        icon && "pl-[38px]",
        clearable && "peer pr-9",
        className,
      )}
      {...props}
    />
  );
  if (!icon && !clearable) return input;
  return (
    <span className="relative block">
      {icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      )}
      {input}
      {clearable && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={(event) => clearInput(event.currentTarget)}
          className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-subtle-foreground outline-none peer-placeholder-shown:hidden peer-disabled:hidden hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </span>
  );
}

// Going through the native setter and an `input` event makes React fire
// `onChange`, so controlled and uncontrolled inputs both clear.
function clearInput(button: HTMLButtonElement) {
  const input = button.previousElementSibling as HTMLInputElement;
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
}

export namespace Input {
  export type Props = React.ComponentProps<"input"> & {
    icon?: React.ReactNode;
    // ui/ can't translate, so a search input shows its clear button only when
    // the caller passes this label.
    clearLabel?: string;
  };
}
