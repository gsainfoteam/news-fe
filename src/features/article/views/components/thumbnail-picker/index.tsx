import { type ReactNode, useId } from "react";

import { CheckIcon, ImageIcon, SparklesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/common/lib/cn";

import { type ThumbnailOption } from "../../../viewmodels/article-editor";

export function ThumbnailPicker({
  options,
  value,
  onChange,
}: ThumbnailPicker.Props) {
  const { t } = useTranslation();
  const name = useId();
  const hintId = useId();

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-center">
        <ImageIcon
          aria-hidden="true"
          className="size-5 text-subtle-foreground"
        />
        <p className="text-xs text-subtle-foreground">
          {t(
            "admin.editor.thumbnailEmpty",
            "본문에 이미지를 넣으면 여기서 대표 이미지를 고를 수 있습니다.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={t("admin.editor.thumbnail", "대표 이미지")}
        aria-describedby={hintId}
        className="grid grid-cols-3 gap-2 mobile:grid-cols-4"
      >
        <Tile
          name={name}
          checked={value === null}
          onSelect={() => onChange(null)}
          label={t("admin.editor.thumbnailAuto", "자동")}
        >
          <span className="flex size-full flex-col items-center justify-center gap-1 bg-surface text-muted-foreground">
            <SparklesIcon aria-hidden="true" className="size-4" />
            <span className="text-2xs font-semibold">
              {t("admin.editor.thumbnailAuto", "자동")}
            </span>
          </span>
        </Tile>
        {options.map((option, index) => (
          <Tile
            key={option.src}
            name={name}
            checked={value === option.src}
            onSelect={() => onChange(option.src)}
            label={
              option.inBody
                ? t("admin.editor.thumbnailImage", "본문 {{n}}번째 이미지", {
                    n: index + 1 - (options[0].inBody ? 0 : 1),
                  })
                : t(
                    "admin.editor.thumbnailDetached",
                    "지금 대표 이미지 (본문에 없음)",
                  )
            }
          >
            <img
              src={option.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
            {!option.inBody && (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-2xs font-semibold text-white">
                {t("admin.editor.thumbnailNotInBody", "본문에 없음")}
              </span>
            )}
          </Tile>
        ))}
      </div>
      <p id={hintId} className="text-xs text-subtle-foreground">
        {t(
          "admin.editor.thumbnailHelp",
          "목록 썸네일과 링크 미리보기에 쓰입니다. 자동으로 두면 본문의 첫 이미지를 씁니다.",
        )}
      </p>
    </div>
  );
}

export namespace ThumbnailPicker {
  export type Props = {
    options: ThumbnailOption[];
    /** Null is "자동", the first body image. */
    value: string | null;
    onChange: (value: string | null) => void;
  };
}

function Tile({
  name,
  checked,
  onSelect,
  label,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative aspect-4/3 cursor-pointer overflow-hidden rounded-md border border-border transition-shadow",
        "has-checked:border-primary has-checked:ring-2 has-checked:ring-primary",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        aria-label={label}
        className="sr-only"
      />
      {children}
      {checked && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 grid size-5 place-content-center rounded-full bg-primary text-primary-foreground"
        >
          <CheckIcon strokeWidth={3} className="size-3" />
        </span>
      )}
    </label>
  );
}
