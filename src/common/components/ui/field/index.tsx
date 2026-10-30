import * as React from "react";
import { useMemo } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlertIcon } from "lucide-react";

import { Label } from "@/common/components/ui/label";
import { Separator } from "@/common/components/ui/separator";
import { cn } from "@/common/lib/cn";

export function FieldSet({
  className,
  ...props
}: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

export function FieldLegend({
  className,
  variant = "legend",
  ...props
}: FieldLegend.Props) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-semibold data-[variant=label]:text-sm data-[variant=legend]:text-h4",
        className,
      )}
      {...props}
    />
  );
}

export namespace FieldLegend {
  export type Props = React.ComponentProps<"legend"> & {
    variant?: "legend" | "label";
  };
}

export function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-1.5", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center gap-2 has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-0.5",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto [&>.sr-only]:w-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export function Field({
  className,
  orientation = "vertical",
  ...props
}: Field.Props) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

export namespace Field {
  export type Props = React.ComponentProps<"div"> &
    VariantProps<typeof fieldVariants>;
}

export function FieldContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  required,
  optional,
  children,
  ...props
}: FieldLabel.Props) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "block w-fit group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-brand-text">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1 font-medium text-subtle-foreground">
          {optional}
        </span>
      )}
    </Label>
  );
}

export namespace FieldLabel {
  export type Props = React.ComponentProps<typeof Label> & {
    required?: boolean;
    // ui/ can't translate, so the caller passes the text, e.g. "(선택)".
    optional?: React.ReactNode;
  };
}

export function FieldTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-semibold group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-xs text-subtle-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 h-5 text-sm", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-subtle-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

export function FieldError({
  className,
  children,
  errors,
  ...props
}: FieldError.Props) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(
        "flex items-start gap-1.5 text-xs text-destructive-text",
        className,
      )}
      {...props}
    >
      <CircleAlertIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
      <div>{content}</div>
    </div>
  );
}

export namespace FieldError {
  export type Props = React.ComponentProps<"div"> & {
    errors?: Array<{ message?: string } | undefined>;
  };
}
