import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import type { Service } from "../content/services";

export default function ServiceRow({
  keyPrefix,
  hasChips,
}: Service): ReactElement {
  const { t } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  // i18next resources aren't typed here, so returnObjects: true needs an
  // explicit cast -- the resource is a plain string[] in both locales.
  const chips = hasChips
    ? (t(`${keyPrefix}.chips`, { returnObjects: true }) as string[])
    : [];

  return (
    <div
      ref={ref}
      className={[
        "grid grid-cols-1 gap-5 border-t border-line py-8 last:border-b xs:py-10 xl:py-14 sm:grid-cols-[0.55fr_1fr] sm:gap-14",
        className,
      ].join(" ")}
    >
      <div>
        <div className="text-sm text-accent">{t(`${keyPrefix}.tag`)}</div>
        <h3 className="mb-3 text-[26px]">{t(`${keyPrefix}.title`)}</h3>
      </div>
      <div>
        <p className="mb-5 max-w-[56ch] text-[17px] text-ink-soft">
          {t(`${keyPrefix}.situation`)}
        </p>
        {hasChips ? (
          <div className="flex flex-wrap gap-x-3 gap-y-2.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-[10px] border border-line bg-bg-card px-4 py-[9px] text-[14.5px] text-ink-soft"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <blockquote className="serif mb-[22px] max-w-[52ch] border-l-2 border-accent-soft pl-5 text-[19px] leading-[1.5] text-ink italic">
            {t(`${keyPrefix}.blockquote`)}
          </blockquote>
        )}
      </div>
    </div>
  );
}
