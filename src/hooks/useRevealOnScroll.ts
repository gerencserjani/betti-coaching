import { useEffect, useRef, useState, type RefObject } from "react";

const BASE_CLASSES =
  "transition-[opacity,transform] duration-700 ease-[ease] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0";
const HIDDEN_CLASSES = "opacity-0 translate-y-[22px]";
const VISIBLE_CLASSES = "opacity-100 translate-y-0";

interface RevealOnScroll<T extends HTMLElement> {
  ref: RefObject<T | null>;
  className: string;
}

export function useRevealOnScroll<
  T extends HTMLElement = HTMLDivElement,
>(): RevealOnScroll<T> {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: [
      BASE_CLASSES,
      isVisible ? VISIBLE_CLASSES : HIDDEN_CLASSES,
    ].join(" "),
  };
}
