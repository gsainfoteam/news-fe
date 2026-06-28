import { cn } from "@/common/lib";

export function NavigationBar({ items }: NavigationBar.Props) {
  return (
    <nav>
      <div className="mx-auto max-w-7xl px-6">
        <ul className="flex items-center gap-8 overflow-x-auto">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  "text-nav block border-b-2 py-3 text-neutral-600 transition-colors hover:text-neutral-900",
                  item.active
                    ? "border-primary"
                    : "hover:border-secondary border-transparent",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export namespace NavigationBar {
  export type Item = {
    label: string;
    href: string;
    active?: boolean;
  };
  export type Props = {
    items: Item[];
  };
}
