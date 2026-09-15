import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[]): string | undefined {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // IntersectionObserver only fires at sparse threshold-crossing moments,
    // not continuously during a (possibly animated/smooth) scroll -- so a
    // snapshot taken in its callback can be stale by the time scrolling
    // settles. A scroll listener, rAF-throttled, always recomputes from the
    // live, current positions instead.
    let ticking = false;

    const updateActiveId = () => {
      ticking = false;

      // At the bottom of the (currently scrollable) document, the last
      // section can't necessarily be scrolled all the way to its "ideal"
      // scroll-margin position if there isn't enough content below it to
      // scroll into -- true at the very end of any real page, and also
      // whenever a later section hasn't been built yet. Treat "can't
      // scroll further" as "the last section is active" instead of
      // measuring a position the browser was physically unable to reach.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1;
      if (atBottom) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      const header = document.querySelector("header");
      const probeY = (header?.getBoundingClientRect().height ?? 76) + 20;

      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= probeY) {
          current = el.id;
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActiveId);
    };

    updateActiveId();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionIds]);

  return activeId;
}
