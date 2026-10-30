import * as React from "react";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Sonner injects unlayered CSS that beats Tailwind utilities, so toasts are
// `unstyled` and drawn entirely by these classes.
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      icons={{
        success: <CircleCheckIcon className="size-4.5 text-success" />,
        info: <InfoIcon className="size-4.5 text-info" />,
        warning: <TriangleAlertIcon className="size-4.5 text-warning" />,
        error: <OctagonXIcon className="size-4.5 text-destructive-text" />,
        loading: (
          <Loader2Icon className="size-4.5 animate-spin text-subtle-foreground" />
        ),
      }}
      style={{ "--width": "360px" } as React.CSSProperties}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg",
          title: "font-medium",
          description: "text-xs text-subtle-foreground",
          actionButton:
            "ml-auto shrink-0 text-sm font-semibold text-brand-text",
          cancelButton:
            "ml-auto shrink-0 text-sm font-semibold text-subtle-foreground",
        },
      }}
      {...props}
    />
  );
}
