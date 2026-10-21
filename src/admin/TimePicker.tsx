import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

/**
 * A button that opens a popover with two scrollable hour/minute columns,
 * replacing a plain <input type="time"> (which renders 12h AM/PM in Chrome
 * regardless of a `lang` hint -- it derives that format from the browser's
 * own language setting, not the page) and the bare native <select> pair this
 * used to be, which looked out of place next to the redesigned date picker.
 */
export function TimePicker({
  value,
  onChange,
  bg = "bg-bg",
}: {
  value: string;
  onChange: (value: string) => void;
  bg?: "bg-bg" | "bg-bg-card";
}): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hh, mm] = value.split(":");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`rounded-lg border border-line ${bg} px-2 py-1.5 text-ink transition-colors duration-150 hover:border-accent-soft`}
      >
        {hh}:{mm}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 flex overflow-hidden rounded-lg border border-line bg-bg-card shadow-lg">
          <ScrollColumn
            label="Óra"
            options={HOURS}
            value={hh}
            isOpen={isOpen}
            onSelect={(h) => onChange(`${h}:${mm}`)}
          />
          <div className="w-px bg-line" />
          <ScrollColumn
            label="Perc"
            options={MINUTES}
            value={mm}
            isOpen={isOpen}
            onSelect={(m) => onChange(`${hh}:${m}`)}
          />
        </div>
      )}
    </div>
  );
}

function ScrollColumn({
  label,
  options,
  value,
  isOpen,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  isOpen: boolean;
  onSelect: (value: string) => void;
}): ReactElement {
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Only scroll the selected option into view the moment the popover opens
  // -- not on every value change, or picking an hour would yank the minute
  // column's scroll position around too.
  useEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen]);

  return (
    <div
      role="listbox"
      aria-label={label}
      className="max-h-48 w-12 overflow-y-auto py-1"
    >
      {options.map((opt) => (
        <button
          key={opt}
          ref={opt === value ? selectedRef : undefined}
          type="button"
          role="option"
          aria-selected={opt === value}
          onClick={() => onSelect(opt)}
          className={[
            "block w-full px-2 py-1 text-center text-sm transition-colors duration-150",
            opt === value
              ? "bg-accent-soft font-medium text-ink"
              : "text-ink hover:bg-bg-panel",
          ].join(" ")}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
