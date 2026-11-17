import { type ReactNode } from "react";

import { cn } from "@/common/lib/cn";

// The centered notice every sign-in state uses (login required, login failed,
// and the CMS's not-member and forbidden screens), so they read as one set.
export function AuthMessage({
  icon,
  title,
  description,
  className,
  children,
}: AuthMessage.Props) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-[420px] flex-col items-center gap-4 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icon}
      </span>
      <h1 className="text-h3">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

export namespace AuthMessage {
  export type Props = {
    icon: ReactNode;
    title: string;
    description: string;
    className?: string;
    /** Actions, laid out as a centered button row. */
    children?: ReactNode;
  };
}
