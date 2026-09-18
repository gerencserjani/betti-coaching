import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRevealOnScroll } from "./useRevealOnScroll";

// jsdom doesn't implement IntersectionObserver -- this fake captures the
// callback each instance was created with so a test can fire it manually to
// simulate the observed element scrolling into view.
let observedCallbacks: IntersectionObserverCallback[] = [];

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observedCallbacks.push(callback);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

function triggerIntersection(isIntersecting: boolean) {
  const callback = observedCallbacks.at(-1)!;
  act(() => {
    callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function TestComponent() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="target">
      {isVisible ? "visible" : "hidden"}
    </div>
  );
}

beforeEach(() => {
  observedCallbacks = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRevealOnScroll", () => {
  it("starts hidden", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("target")).toHaveTextContent("hidden");
  });

  it("becomes visible once the element intersects the viewport", () => {
    render(<TestComponent />);
    triggerIntersection(true);
    expect(screen.getByTestId("target")).toHaveTextContent("visible");
  });

  it("stays hidden if the callback fires with isIntersecting: false", () => {
    render(<TestComponent />);
    triggerIntersection(false);
    expect(screen.getByTestId("target")).toHaveTextContent("hidden");
  });
});
