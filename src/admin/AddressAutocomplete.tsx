import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";

const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

interface Suggestion {
  placeId: string;
  text: string;
}

async function fetchSuggestions(
  input: string,
  signal: AbortSignal,
): Promise<Suggestion[]> {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
      },
      body: JSON.stringify({ input, languageCode: "hu", regionCode: "hu" }),
      signal,
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.suggestions ?? [])
    .map(
      (s: { placePrediction?: { placeId: string; text: { text: string } } }) =>
        s.placePrediction,
    )
    .filter(
      (p: unknown): p is { placeId: string; text: { text: string } } => !!p,
    )
    .map((p: { placeId: string; text: { text: string } }) => ({
      placeId: p.placeId,
      text: p.text.text,
    }));
}

export default function AddressAutocomplete({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}): ReactElement {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!apiKey || text.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetchSuggestions(text, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setHighlighted(0);
        })
        .catch(() => {
          // A stale/aborted request or a network hiccup -- the field still
          // works as plain text, just without suggestions this time.
        });
    }, 300);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectSuggestion(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        className={className}
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-bg-card text-sm shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.placeId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className={[
                  "block w-full px-3 py-2 text-left text-ink",
                  i === highlighted ? "bg-bg-panel" : "",
                ].join(" ")}
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
