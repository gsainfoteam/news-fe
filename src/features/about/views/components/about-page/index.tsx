import { type ReactNode } from "react";

import { type i18n as I18n } from "i18next";
import { ArrowUpRightIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { i18n as appI18n } from "@/common/lib/i18n";

import {
  type AboutPageData,
  formatDay,
  formatMonthDay,
  toInstagramHandle,
  toLinkLabel,
  toSafeUrl,
} from "../../../viewmodels/about-page";

// Own React root under Astro; see Header for why i18n is a prop.
export function AboutPage({ i18n = appI18n, about }: AboutPage.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <AboutPageContent about={about} />
    </I18nextProvider>
  );
}

export namespace AboutPage {
  export type Props = {
    i18n?: I18n;
    about: AboutPageData;
  };
}

function AboutPageContent({ about }: { about: AboutPageData }) {
  const { t } = useTranslation();

  return (
    <div className="pt-12 pb-24 mobile:pt-8 mobile:pb-16">
      <header className="flex max-w-[760px] flex-col gap-3">
        <p className="text-xs font-bold text-brand-text">
          {t("about.kicker", "신문 소개")}
        </p>
        <h1 className="text-[56px] leading-none font-extrabold tracking-[-0.045em] mobile:text-[36px]">
          {t("site.name", "지스트신문")}
        </h1>
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-[72px] mobile:mt-7 mobile:grid-cols-1 mobile:gap-12">
        <div className="flex min-w-0 flex-col gap-16 mobile:gap-12">
          <section aria-label={t("about.introduction", "소개")}>
            <div className="flex max-w-[680px] flex-col gap-4 text-body-lg text-foreground">
              {about.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="about-history">
            <SectionHeading id="about-history">
              {t("about.history", "연혁")}
            </SectionHeading>
            {about.timeline.length === 0 ? (
              <p className="py-6 text-sm text-subtle-foreground">
                {t("about.historyEmpty", "아직 등록된 연혁이 없습니다.")}
              </p>
            ) : (
              <ol>
                {about.timeline.map(({ year, entries }) => (
                  <li
                    key={year}
                    className="grid grid-cols-[120px_minmax(0,1fr)] gap-6 border-b border-border py-6 last:border-b-0 mobile:grid-cols-1 mobile:gap-3 mobile:py-5"
                  >
                    <h3 className="font-heading text-[28px] leading-none font-extrabold tracking-[-0.03em] tabular-nums mobile:text-[22px]">
                      <time dateTime={year}>{year}</time>
                    </h3>
                    <ol className="flex flex-col gap-3.5">
                      {entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 text-base"
                        >
                          <time
                            dateTime={entry.date}
                            className="pt-px text-sm font-semibold text-brand-text tabular-nums"
                          >
                            {formatMonthDay(entry.date)}
                          </time>
                          <p className="text-foreground">{entry.content}</p>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside
          aria-labelledby="about-masthead"
          className="sticky top-6 mobile:static"
        >
          <SectionHeading id="about-masthead">
            {t("about.masthead", "발행 정보")}
          </SectionHeading>
          <Masthead about={about} />
        </aside>
      </div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="border-b-2 border-border-strong pb-2.5 text-[15px] font-extrabold"
    >
      {children}
    </h2>
  );
}

function Masthead({ about }: { about: AboutPageData }) {
  const { t } = useTranslation();
  const homepage = toSafeUrl(about.homepage);
  const instagram = toSafeUrl(about.instagram);

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: t("about.foundedAt", "창간"),
      value: (
        <time dateTime={about.foundedAt} className="tabular-nums">
          {formatDay(about.foundedAt)}
        </time>
      ),
    },
    { label: t("about.publisher", "발행인"), value: about.publisher },
    { label: t("about.director", "주간"), value: about.director },
    { label: t("about.editorInChief", "편집장"), value: about.editorInChief },
    {
      label: t("about.address", "주소"),
      value: <address className="not-italic">{about.address}</address>,
    },
    {
      label: t("about.email", "이메일"),
      value: (
        <OutboundLink href={`mailto:${about.email}`}>
          {about.email}
        </OutboundLink>
      ),
    },
    {
      label: t("about.homepage", "홈페이지"),
      value: homepage ? (
        <OutboundLink href={homepage} newTab>
          {toLinkLabel(homepage)}
        </OutboundLink>
      ) : (
        about.homepage
      ),
    },
    {
      label: t("about.instagram", "인스타그램"),
      value: instagram ? (
        <OutboundLink href={instagram} newTab>
          {toInstagramHandle(instagram)}
        </OutboundLink>
      ) : (
        about.instagram
      ),
    },
  ];

  return (
    <dl className="text-sm">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-border py-3 last:border-b-0"
        >
          <dt className="font-semibold text-subtle-foreground">{label}</dt>
          <dd className="min-w-0 break-words text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Same look as the footer's outbound links: underline plus arrow, so they
// read as clickable and as leaving the site.
function OutboundLink({
  href,
  newTab,
  children,
}: {
  href: string;
  newTab?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
      className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-brand-text"
    >
      <span className="min-w-0 break-all">{children}</span>
      {newTab && (
        <span className="sr-only">
          {t("footer.newTab", "(새 탭에서 열림)")}
        </span>
      )}
      <ArrowUpRightIcon aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  );
}
