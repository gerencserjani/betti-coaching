import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { DayPicker } from "react-day-picker";
import { hu } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { formatDate } from "./utils";

function parseISODate(isoDate: string): Date | undefined {
  if (!isoDate) return undefined;
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Overrides react-day-picker's own CSS variables (see its style.css) with
// this app's existing color tokens instead of fighting its class names --
// everything else in the default stylesheet already uses `color: inherit`,
// so wrapping in text-ink/bg-bg-card is enough for the rest.
const calendarVars = {
  "--rdp-accent-color": "var(--accent)",
  "--rdp-accent-background-color": "var(--accent-soft)",
  "--rdp-today-color": "var(--accent)",
} as CSSProperties;

/**
 * A button that opens a react-day-picker calendar popover, replacing the
 * native <input type="date"> (whose browser-chrome look clashed with the
 * rest of the redesigned Availability page).
 */
export function DatePicker({
  value,
  onChange,
  bg = "bg-bg-card",
}: {
  value: string;
  onChange: (value: string) => void;
  bg?: "bg-bg" | "bg-bg-card";
}): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = parseISODate(value);

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
        className={`rounded-lg border border-line ${bg} px-2 py-1.5 text-left text-ink transition-colors duration-150 hover:border-accent-soft`}
      >
        {selected ? (
          formatDate(value)
        ) : (
          <span className="text-ink-soft">Válassz dátumot</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 rounded-xl border border-line bg-bg-card p-2 text-ink shadow-lg">
          <DayPicker
            mode="single"
            locale={hu}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              onChange(toISODate(date));
              setIsOpen(false);
            }}
            style={calendarVars}
            classNames={{
              // DayPicker's classNames prop *replaces* the default class per
              // key rather than appending to it (see its own DayPicker.js:
              // `{ ...getDefaultClassNames(), ...props.classNames }`) -- the
              // base "rdp-day_button" class has to stay or the day cells
              // lose their --rdp-day_button-width/height/border-radius
              // sizing entirely and collapse to the text's intrinsic size.
              day_button:
                "rdp-day_button transition-colors duration-150 hover:bg-bg-panel",
            }}
          />
        </div>
      )}
    </div>
  );
}
