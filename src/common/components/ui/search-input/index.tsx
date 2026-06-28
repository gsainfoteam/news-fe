import { Icon } from "@/common/components/ui/icon";
import { cn } from "@/common/lib";

export function SearchInput({
  placeholder = "뉴스 제목 또는 기자를 입력하세요",
  className,
}: SearchInput.Props) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">
        <Icon name="magnifying-glass" className="size-5 text-neutral-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border-[1.5px] border-neutral-100 bg-neutral-100 py-2 pr-4 pl-10 text-neutral-900 transition-colors placeholder:text-neutral-400 hover:border-neutral-300 hover:bg-white focus:border-neutral-400 focus:bg-white focus:outline-none"
      />
    </div>
  );
}

export namespace SearchInput {
  export type Props = {
    placeholder?: string;
    className?: string;
  };
}
