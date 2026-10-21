import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";

// Component-level tests don't need a real i18n instance (which has its own
// DOM side effects on import, e.g. syncing document.title/meta tags) --
// react-i18next's own docs recommend stubbing useTranslation for this.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("BookingForm", () => {
  it("disables submit until a valid phone number is entered", async () => {
    const user = userEvent.setup();
    render(
      <BookingForm
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        isSubmitting={false}
        error={null}
      />,
    );

    expect(
      screen.getByRole("button", { name: "booking.form.submit" }),
    ).toBeDisabled();

    // react-phone-number-input renders its own text input without an
    // accessible name from this component -- find it by its container class.
    const phoneField =
      document.querySelector<HTMLInputElement>(".phone-input input")!;
    await user.type(phoneField, "12345");

    expect(screen.getByText("booking.form.phoneInvalid")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "booking.form.submit" }),
    ).toBeDisabled();
  });

  it("enables submit and calls onSubmit with all field values once the phone is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <BookingForm
        onSubmit={onSubmit}
        onBack={vi.fn()}
        isSubmitting={false}
        error={null}
      />,
    );

    const [nameInput, emailInput] = screen.getAllByRole("textbox");
    await user.type(nameInput, "Teszt Elek");
    await user.type(emailInput, "teszt@example.com");

    const phoneField =
      document.querySelector<HTMLInputElement>(".phone-input input")!;
    // A real, valid Hungarian mobile number in international format.
    await user.type(phoneField, "301234567");

    expect(
      screen.queryByText("booking.form.phoneInvalid"),
    ).not.toBeInTheDocument();
    const submitButton = screen.getByRole("button", {
      name: "booking.form.submit",
    });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const values = onSubmit.mock.calls[0][0];
    expect(values.clientName).toBe("Teszt Elek");
    expect(values.clientEmail).toBe("teszt@example.com");
    expect(values.clientPhone).toBe("+36301234567");
  });

  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <BookingForm
        onSubmit={vi.fn()}
        onBack={onBack}
        isSubmitting={false}
        error={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "booking.form.back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows the error message when the error prop is set", () => {
    render(
      <BookingForm
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        isSubmitting={false}
        error="Ez a szolgáltatás már nem elérhető."
      />,
    );
    expect(
      screen.getByText("Ez a szolgáltatás már nem elérhető."),
    ).toBeInTheDocument();
  });

  it("shows the submitting label and disables the button while submitting", () => {
    render(
      <BookingForm
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        isSubmitting={true}
        error={null}
      />,
    );
    expect(
      screen.getByRole("button", { name: "booking.form.submitting" }),
    ).toBeDisabled();
  });
});
