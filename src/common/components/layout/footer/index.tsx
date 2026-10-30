import { type i18n as I18n } from "i18next";
import { ArrowUpRightIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { getCategoryNav } from "@/features/category";

const EMAIL = "editor@gist.ac.kr";

// shortcut: hardcoded from gistnews.co.kr. Once the build loads members,
// take the editor from `GET /member` (role EDITOR_IN_CHIEF) and pass the
// names in; the web manager has no member role yet.
const STAFF = { editor: "이다연", webManager: "김도현" };

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/GistSinmoon" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/gistnews._.official/",
  },
];

// Links that leave the site (mail app, social) get an underline and an
// arrow so they read as clickable and as going elsewhere.
const outboundLinkClass =
  "inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground";

function OutboundIcon() {
  return <ArrowUpRightIcon aria-hidden="true" className="size-3.5 shrink-0" />;
}

// Own React root under Astro; see Header for why i18n is a prop.
export function Footer({ i18n = appI18n }: Footer.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <FooterContent />
    </I18nextProvider>
  );
}

function FooterContent() {
  const { t, i18n } = useTranslation();
  const { groups, notice } = getCategoryNav(t, i18n.language);
  const path = (to: string) => localizePath(i18n.language, to);
  const siteName = t("site.name", "지스트신문");

  return (
    <footer className="mt-24 border-t border-border bg-surface pt-12 pb-8 mobile:mt-16 mobile:pt-9 mobile:pb-7">
      <div className="page-container">
        <div className="grid grid-cols-[1.4fr_repeat(6,minmax(0,1fr))] gap-6 mobile:grid-cols-2 mobile:gap-x-4">
          <div className="flex flex-col items-start gap-3 mobile:col-span-full">
            <img
              src="/logo.png"
              alt={siteName}
              width={450}
              height={114}
              className="h-6 w-auto"
            />
            <address className="text-sm text-muted-foreground not-italic">
              {t(
                "footer.address",
                "광주광역시 북구 첨단과기로 123 제1학생회관 3층 GIST신문사",
              )}
              <br />
              <a href={`mailto:${EMAIL}`} className={outboundLinkClass}>
                {EMAIL}
                <OutboundIcon />
              </a>
            </address>
            <p className="text-xs text-subtle-foreground">
              {t(
                "footer.staff",
                "편집장 {{editor}}, 웹관리 {{webManager}}",
                STAFF,
              )}
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="mb-2.5 text-sm font-bold">
                <a href={group.href} className="hover:text-brand-text">
                  {group.label}
                </a>
              </h3>
              {group.children.length > 0 && (
                <ul className="text-sm leading-loose text-muted-foreground">
                  {group.children.map((child) => (
                    <li key={child.category}>
                      <a href={child.href} className="hover:text-foreground">
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs text-subtle-foreground">
          <span>© {siteName}</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-muted-foreground">
            <a href={notice.href} className="hover:text-foreground">
              {notice.label}
            </a>
            <a href={path("/report")} className="hover:text-foreground">
              {t("header.report", "제보하기")}
            </a>
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={outboundLinkClass}
              >
                {label}
                <span className="sr-only">
                  {t("footer.newTab", "(새 탭에서 열림)")}
                </span>
                <OutboundIcon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export namespace Footer {
  export type Props = {
    i18n?: I18n;
  };
}
