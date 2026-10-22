import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentType } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

// AddressAutocomplete reads VITE_GOOGLE_PLACES_API_KEY once at module load
// time, so each scenario below stubs the env var and re-imports the module
// fresh (vi.resetModules) rather than importing it once at the top of the
// file -- a single static import would only ever see whichever value was
// set first.
async function importFreshComponent() {
  vi.resetModules();
  const mod = await import("./AddressAutocomplete");
  return mod.default;
}

// AddressAutocomplete is a controlled input -- driving it with userEvent
// requires actually feeding onChange back into value like a real caller
// would, otherwise React resets the DOM value to the fixed prop after every
// keystroke and only the last character ever reaches the component.
function Harness({
  Component,
  onChange,
}: {
  Component: ComponentType<{
    value: string;
    onChange: (value: string) => void;
  }>;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <Component
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

function fakePlacesResponse(suggestions: { placeId: string; text: string }[]) {
  return {
    suggestions: suggestions.map((s) => ({
      placePrediction: { placeId: s.placeId, text: { text: s.text } },
    })),
  };
}

describe("AddressAutocomplete without an API key", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GOOGLE_PLACES_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("falls back to a plain input and never calls fetch", async () => {
    const user = userEvent.setup();
    const AddressAutocomplete = await importFreshComponent();
    const onChange = vi.fn();
    render(<Harness Component={AddressAutocomplete} onChange={onChange} />);

    await user.type(screen.getByRole("combobox"), "Szeged Kossuth");

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // The field must still work as an ordinary controlled text input.
    expect(onChange).toHaveBeenLastCalledWith("Szeged Kossuth");
  });
});

describe("AddressAutocomplete with an API key", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GOOGLE_PLACES_API_KEY", "fake-key");
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("debounces input and shows suggestions after a successful fetch", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const fetchMock: Mock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          fakePlacesResponse([
            { placeId: "p1", text: "Szeged, Kossuth Lajos sugárút" },
          ]),
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const AddressAutocomplete = await importFreshComponent();
    render(<Harness Component={AddressAutocomplete} onChange={vi.fn()} />);

    await user.type(screen.getByRole("combobox"), "Szeged Kossuth");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    expect(
      await screen.findByRole("option", {
        name: "Szeged, Kossuth Lajos sugárút",
      }),
    ).toBeInTheDocument();
  });

  it("does not fetch for fewer than 3 characters", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const AddressAutocomplete = await importFreshComponent();
    render(<Harness Component={AddressAutocomplete} onChange={vi.fn()} />);

    await user.type(screen.getByRole("combobox"), "Sz");
    await vi.advanceTimersByTimeAsync(500);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("selecting a suggestion with Enter calls onChange and closes the list", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const fetchMock: Mock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          fakePlacesResponse([
            { placeId: "p1", text: "Szeged, Kossuth Lajos sugárút" },
            { placeId: "p2", text: "Szeged, Kossuth Lajos utca" },
          ]),
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const AddressAutocomplete = await importFreshComponent();
    const onChange = vi.fn();
    render(<Harness Component={AddressAutocomplete} onChange={onChange} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "Szeged Kossuth");
    await screen.findByRole("listbox");

    // First suggestion is highlighted by default -- Enter should pick it.
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenLastCalledWith("Szeged, Kossuth Lajos sugárút");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ArrowDown moves the highlighted suggestion before Enter selects it", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const fetchMock: Mock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          fakePlacesResponse([
            { placeId: "p1", text: "Szeged, Kossuth Lajos sugárút" },
            { placeId: "p2", text: "Szeged, Kossuth Lajos utca" },
          ]),
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const AddressAutocomplete = await importFreshComponent();
    const onChange = vi.fn();
    render(<Harness Component={AddressAutocomplete} onChange={onChange} />);

    await user.type(screen.getByRole("combobox"), "Szeged Kossuth");
    await screen.findByRole("listbox");

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenLastCalledWith("Szeged, Kossuth Lajos utca");
  });
});
