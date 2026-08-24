import React from "react";

interface ThemeKitLogoProps {
  size?: number; // controls icon height + scales wordmark font-size proportionally
}

const ThemeKitLogo = ({ size = 42 }: ThemeKitLogoProps) => {
  return (
    <div
      className="flex items-center gap-2.5 no-underline shrink-0"
      style={{ height: size }}
    >
      {/* Icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 42 42"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="38"
          height="38"
          rx="10"
          fill="none"
          stroke="var(--theme-color-primary)"
          strokeWidth="2"
        />
        <circle
          cx="14"
          cy="27"
          r="6"
          fill="var(--theme-color-primary)"
          opacity="1"
        />
        <circle
          cx="22"
          cy="16"
          r="5"
          fill="var(--theme-color-primary)"
          opacity="0.65"
        />
        <circle
          cx="29"
          cy="25"
          r="4"
          fill="var(--theme-color-primary)"
          opacity="0.35"
        />
      </svg>

      {/* Wordmark — text clipped to theme gradient, container stays transparent.
          Font family cascades from the <html> CSS variable (`--font-outfit`,
          declared in the server layout) so the class hash is never duplicated
          across the server and client bundles. */}
      <span
        className="block leading-none select-none"
        style={{
          fontSize: size * 0.62,
          fontWeight: 700,
          fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.02em",
          backgroundImage:
            "linear-gradient(90deg, var(--theme-color-primary), var(--theme-color-primary-light, var(--theme-color-primary)), var(--theme-color-primary))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
      >
        theme-kit
      </span>
    </div>
  );
};

export default ThemeKitLogo;
