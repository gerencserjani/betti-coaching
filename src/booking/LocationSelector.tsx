import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { LocationType } from "../api/models";

export default function LocationSelector({
  locations,
  onSelect,
}: {
  locations: LocationType[];
  onSelect: (location: LocationType) => void;
}): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2.5">
      {locations.map((location) => (
        <button
          key={location}
          type="button"
          onClick={() => onSelect(location)}
          className="rounded-full border border-line bg-bg-card px-4 py-2 text-sm text-ink transition-colors duration-200 hover:border-accent-soft"
        >
          {t(`booking.location.${location}`)}
        </button>
      ))}
    </div>
  );
}
