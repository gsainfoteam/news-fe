import * as React from "react";

import { CircleAlertIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { EmptyState } from "@/common/components/ui/empty-state";
import { cn } from "@/common/lib/cn";

// Never pass `error.message` or a stack in here: the screen shows what the
// reader can do, not what the server said.
export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  retrying = false,
  className,
  ...props
}: ErrorState.Props) {
  return (
    <EmptyState
      data-slot="error-state"
      role="alert"
      icon={<CircleAlertIcon className="text-destructive-text" />}
      title={title}
      description={description}
      className={cn("border-solid", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="sm"
        className="mt-1"
        onClick={onRetry}
        disabled={retrying}
      >
        <RotateCwIcon className={cn(retrying && "animate-spin")} />
        {retryLabel}
      </Button>
    </EmptyState>
  );
}

export namespace ErrorState {
  export type Props = Omit<React.ComponentProps<"div">, "title"> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    retryLabel: string;
    onRetry: () => void;
    // Pass the query's `isFetching`: a refetch after an error keeps
    // `isError` true, so this is what tells the reader the retry started.
    retrying?: boolean;
  };
}
