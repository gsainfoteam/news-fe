import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/common/components/ui/combobox";
import { getRoleLabels } from "@/features/auth";

import { type AuthorOption } from "../../../viewmodels/article-editor";

export function AuthorPicker({
  options,
  value,
  onChange,
  loading,
  invalid,
  id,
}: AuthorPicker.Props) {
  const { t } = useTranslation();
  const anchor = useComboboxAnchor();
  const roles = getRoleLabels(t);
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const selected = value.flatMap((authorId) => byId.get(authorId) ?? []);

  return (
    <Combobox
      items={options}
      multiple
      autoHighlight
      value={selected}
      onValueChange={(next) => onChange(next.map((o) => o.id))}
      itemToStringLabel={(o) => o.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxChips ref={anchor}>
        {selected.map((o) => (
          <ComboboxChip
            key={o.id}
            removeLabel={t("admin.editor.removeAuthor", "{{name}} 빼기", {
              name: o.name,
            })}
          >
            <AuthorAvatar option={o} inChip />
            {o.name}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          id={id}
          aria-invalid={invalid || undefined}
          placeholder={t("admin.editor.searchMember", "멤버 검색")}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          {loading
            ? t("admin.editor.membersLoading", "멤버 목록을 불러오는 중입니다")
            : t("admin.editor.noMember", "일치하는 멤버가 없습니다")}
        </ComboboxEmpty>
        <ComboboxList>
          {(o: AuthorOption) => (
            <ComboboxItem key={o.id} value={o}>
              <AuthorAvatar option={o} />
              <span className="grow truncate">{o.name}</span>
              {o.role && (
                <span className="shrink-0 text-2xs text-subtle-foreground">
                  {roles[o.role]}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export namespace AuthorPicker {
  export type Props = {
    options: AuthorOption[];
    /** Selected member ids, in byline order. */
    value: string[];
    onChange: (value: string[]) => void;
    loading?: boolean;
    invalid?: boolean;
    /** For a `<label htmlFor>` outside the picker. */
    id?: string;
  };
}

function AuthorAvatar({
  option,
  inChip,
}: {
  option: AuthorOption;
  inChip?: boolean;
}) {
  return (
    <Avatar
      size="sm"
      aria-hidden="true"
      // The chip is already muted, so its avatar takes the page color.
      className={inChip ? "size-5 bg-background text-[10px]" : undefined}
    >
      {option.picture && <AvatarImage src={option.picture} alt="" />}
      <AvatarFallback>{option.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
