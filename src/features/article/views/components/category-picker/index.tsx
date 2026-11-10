import { useId } from "react";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@/common/components/ui/checkbox";
import { type Category, getCategoryLabels } from "@/features/category";

import {
  EDITOR_CATEGORY_GROUPS,
  isCategoryLocked,
  toggleCategory,
} from "../../../viewmodels/article-editor";

export function CategoryPicker({ value, onChange }: CategoryPicker.Props) {
  const { t } = useTranslation();
  const labels = getCategoryLabels(t);
  const hintId = useId();

  const item = (category: Category) => {
    const locked = isCategoryLocked(value, category);
    return (
      <label
        key={category}
        className="inline-flex cursor-pointer items-center gap-2 text-sm has-data-readonly:cursor-default"
      >
        <Checkbox
          checked={value.includes(category)}
          readOnly={locked}
          aria-describedby={locked ? hintId : undefined}
          onCheckedChange={() => onChange(toggleCategory(value, category))}
        />
        {labels[category]}
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={t("admin.editor.categories", "카테고리")}
        className="flex flex-col gap-2.5"
      >
        {EDITOR_CATEGORY_GROUPS.map(({ category, children }) => (
          <div key={category} className="flex flex-col gap-2.5">
            {item(category)}
            {children.length > 0 && (
              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pl-6">
                {children.map(item)}
              </div>
            )}
          </div>
        ))}
      </div>
      <p id={hintId} className="text-xs text-subtle-foreground">
        {t(
          "admin.editor.categoriesHint",
          "하위 카테고리를 고르면 상위 카테고리도 함께 선택됩니다. 그래야 상위 목록에도 기사가 나옵니다.",
        )}
      </p>
    </div>
  );
}

export namespace CategoryPicker {
  export type Props = {
    value: Category[];
    onChange: (value: Category[]) => void;
  };
}
