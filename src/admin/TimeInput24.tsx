import type { ReactElement } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

// A plain <input type="time"> renders 12h AM/PM here regardless of a `lang`
// hint on the element -- Chrome derives that format from the browser's own
// language setting, not the page. Two selects sidestep it entirely.
export function TimeInput24({
  value,
  onChange,
  bg = "bg-bg",
}: {
  value: string;
  onChange: (value: string) => void;
  bg?: "bg-bg" | "bg-bg-card";
}): ReactElement {
  const [hh, mm] = value.split(":");
  const selectClass = `rounded-lg border border-line ${bg} px-1.5 py-1.5 text-ink`;

  return (
    <div className="flex items-center gap-1">
      <select
        aria-label="Óra"
        value={hh}
        onChange={(e) => onChange(`${e.target.value}:${mm}`)}
        className={selectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-ink-soft">:</span>
      <select
        aria-label="Perc"
        value={mm}
        onChange={(e) => onChange(`${hh}:${e.target.value}`)}
        className={selectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
