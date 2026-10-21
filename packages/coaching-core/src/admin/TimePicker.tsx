import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { hhmmToMinutes, minutesToHHmm } from "./utils";

const STEP_MINUTES = 15;
const TIME_OPTIONS = Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, i) =>
  minutesToHHmm(i * STEP_MINUTES),
);

// Existing data isn't guaranteed to land on a 15-minute mark (the old plain
// hour/minute selects allowed any value) -- splice it into the list so
// opening the picker on, say, "09:10" never silently hides or snaps away
// from the value already saved.
function optionsFor(value: string): string[] {
  if (!value || TIME_OPTIONS.includes(value)) return TIME_OPTIONS;
  const valueMinutes = hhmmToMinutes(value);
  const insertAt = TIME_OPTIONS.findIndex(
    (opt) => hhmmToMinutes(opt) > valueMinutes,
  );
  const options = [...TIME_OPTIONS];
  options.splice(insertAt === -1 ? options.length : insertAt, 0, value);
  return options;
}

/**
 * A button that opens a popover with a single scrollable list of times (15
 * minute steps, the saved value spliced in if it isn't on one), replacing a
 * plain <input type="time"> (which renders 12h AM/PM in Chrome regardless of
 * a `lang` hint -- it derives that format from the browser's own language
 * setting, not the page) and the bare native <select> pair this used to be.
 * A single list reads faster than two independent hour/minute wheels and
 * matches how Calendly/Google Calendar's own time pickers are laid out.
 */
export function TimePicker({
  value,
  onChange,
  ariaLabel,
  bg = "bg-bg",
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  bg?: "bg-bg" | "bg-bg-card";
}): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll the selected option into view the moment the popover opens --
  // not on every value change, or picking a time would yank the list's own
  // scroll position around right as it's about to close.
  useEffect(() => {
    if (isOpen) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`rounded-lg border border-line ${bg} px-2.5 py-1.5 text-sm text-ink transition-colors duration-150 hover:border-accent-soft`}
      >
        {value}
      </button>
      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="brand-scrollbar absolute z-10 mt-1 max-h-52 w-20 overflow-y-auto rounded-lg border border-line bg-bg-card py-1 shadow-lg"
        >
          {optionsFor(value).map((opt) => (
            <button
              key={opt}
              ref={opt === value ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={[
                "block w-full px-2.5 py-1.5 text-center text-sm transition-colors duration-150",
                opt === value
                  ? "bg-accent-soft font-medium text-ink"
                  : "text-ink hover:bg-bg-panel",
              ].join(" ")}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
