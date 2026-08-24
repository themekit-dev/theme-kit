"use client";

import React, { useEffect, useState } from "react";

// A quiet utility control. Deliberately the visual opposite of the Theme
// Inspector (a primary-filled feature button stacked at the same corner):
// neutral surface, muted icon, smaller, and pinned to the very corner so the
// two never read as a pair of similar controls.
export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div
      className="fixed right-8 bottom-10 group"
      style={{ zIndex: 30 }}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        className={`group inline-flex items-center justify-center rounded-full border border-border bg-card/85 backdrop-blur-md w-9 h-9 text-muted-foreground shadow-sm transition-all duration-300 cursor-pointer hover:text-primary hover:border-ring hover:shadow-md ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:-translate-y-0.5"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ScrollToTop;
