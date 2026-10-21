import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

// jsdom doesn't implement scrollIntoView -- TimePicker calls it to bring the
// selected time into view when the popover opens.
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
      ariaLabel="Kezdés"
    />
  );
}

describe("TimePicker", () => {
  it("shows the current value on the trigger and is closed by default", () => {
    render(<Harness initial="09:30" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Kezdés" })).toHaveTextContent(
      "09:30",
    );
    expect(
      screen.queryByRole("listbox", { name: "Kezdés" }),
    ).not.toBeInTheDocument();
  });

  it("offers 15-minute steps and selecting one updates the value and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initial="09:30" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Kezdés" }));
    await user.click(screen.getByRole("option", { name: "09:45" }));

    expect(onChange).toHaveBeenLastCalledWith("09:45");
    expect(
      screen.queryByRole("listbox", { name: "Kezdés" }),
    ).not.toBeInTheDocument();
  });

  it("splices a non-15-minute saved value into the list instead of hiding it", async () => {
    const user = userEvent.setup();
    render(<Harness initial="09:07" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Kezdés" }));

    expect(
      screen.getByRole("option", { name: "09:07", selected: true }),
    ).toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Harness initial="09:30" onChange={vi.fn()} />
        <button type="button">outside</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Kezdés" }));
    expect(screen.getByRole("listbox", { name: "Kezdés" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));

    expect(
      screen.queryByRole("listbox", { name: "Kezdés" }),
    ).not.toBeInTheDocument();
  });
});
