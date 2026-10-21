import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

// jsdom doesn't implement scrollIntoView -- TimePicker calls it to bring the
// selected hour/minute into view when the popover opens.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

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
    <TimePicker
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("TimePicker", () => {
  it("shows the current value on the trigger and is closed by default", () => {
    render(<Harness initial="09:30" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "09:30" })).toBeInTheDocument();
    expect(
      screen.queryByRole("listbox", { name: "Óra" }),
    ).not.toBeInTheDocument();
  });

  it("opens the popover and selecting an hour keeps the minute", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="09:30" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "09:30" }));
    const hourList = screen.getByRole("listbox", { name: "Óra" });
    await user.click(within(hourList).getByRole("option", { name: "17" }));

    expect(onChange).toHaveBeenLastCalledWith("17:30");
  });

  it("selecting a minute keeps the hour", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="09:30" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "09:30" }));
    const minuteList = screen.getByRole("listbox", { name: "Perc" });
    await user.click(within(minuteList).getByRole("option", { name: "45" }));

    expect(onChange).toHaveBeenLastCalledWith("09:45");
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Harness initial="09:30" onChange={vi.fn()} />
        <button type="button">outside</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "09:30" }));
    expect(screen.getByRole("listbox", { name: "Óra" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));

    expect(
      screen.queryByRole("listbox", { name: "Óra" }),
    ).not.toBeInTheDocument();
  });
});
