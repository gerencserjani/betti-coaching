import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { LocationType } from "../api/models";

export default function LocationSelector({
  locations,
  selected,
  onSelect,
}: {
  locations: LocationType[];
  selected?: LocationType | null;
  onSelect: (location: LocationType) => void;
}): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {locations.map((location) => {
        const isSelected = selected === location;
        return (
          <button
            key={location}
            type="button"
            onClick={() => onSelect(location)}
            className={[
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
              isSelected
                ? "border-accent bg-accent text-bg-card"
                : "border-line bg-bg text-ink hover:border-accent-soft",
            ].join(" ")}
          >
            {t(`booking.location.${location}`)}
          </button>
        );
      })}
    </div>
  );
}
