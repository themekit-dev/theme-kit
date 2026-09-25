"use client";

import { useCallback, useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied ✓",
  title,
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title ?? label}
      aria-label={title ?? label}
      aria-live="polite"
      className={`chip shrink-0 ${className ?? ""}`.trim()}
      style={copied ? { color: "var(--theme-color-success)" } : undefined}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
