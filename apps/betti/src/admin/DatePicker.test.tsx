import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";
import { formatDate } from "./utils";

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
    <DatePicker
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("DatePicker", () => {
  it("shows a placeholder when no date is set", () => {
    render(<Harness initial="" onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Válassz dátumot" }),
    ).toBeInTheDocument();
  });

  it("shows the formatted date on the trigger when a date is set", () => {
    render(<Harness initial="2026-03-10" onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: formatDate("2026-03-10") }),
    ).toBeInTheDocument();
  });

  it("selecting a day in the calendar calls onChange with the new ISO date and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="2026-03-10" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: formatDate("2026-03-10") }),
    );
    await user.click(screen.getByText("15", { selector: "button" }));

    expect(onChange).toHaveBeenLastCalledWith("2026-03-15");
    expect(
      screen.queryByText("15", { selector: "button" }),
    ).not.toBeInTheDocument();
  });

  it("closes when clicking outside without changing the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <div>
        <Harness initial="2026-03-10" onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    );

    await user.click(
      screen.getByRole("button", { name: formatDate("2026-03-10") }),
    );
    expect(screen.getByText("15", { selector: "button" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));

    expect(
      screen.queryByText("15", { selector: "button" }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
