import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimeInput24 } from "./AvailabilityPage";

// Controlled component -- feed onChange back into value like a real caller.
function Harness({
  initial,
  onChange,
}: {
  initial: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <TimeInput24
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("TimeInput24", () => {
  it("renders the hour and minute selects with the initial value", () => {
    render(<Harness initial="09:30" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Óra" })).toHaveValue("09");
    expect(screen.getByRole("combobox", { name: "Perc" })).toHaveValue("30");
  });

  it("changing the hour keeps the minute and calls onChange with 24h format", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="09:30" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Óra" }),
      "17",
    );

    expect(onChange).toHaveBeenLastCalledWith("17:30");
  });

  it("changing the minute keeps the hour", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="09:30" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Perc" }),
      "45",
    );

    expect(onChange).toHaveBeenLastCalledWith("09:45");
  });

  it("offers all 24 hours and all 60 minutes", () => {
    render(<Harness initial="00:00" onChange={vi.fn()} />);
    expect(
      screen.getAllByRole("option", { name: /^\d{2}$/ }).length,
    ).toBeGreaterThan(0);
    const hourSelect = screen.getByRole("combobox", { name: "Óra" });
    expect(hourSelect.querySelectorAll("option")).toHaveLength(24);
    const minuteSelect = screen.getByRole("combobox", { name: "Perc" });
    expect(minuteSelect.querySelectorAll("option")).toHaveLength(60);
  });
});
