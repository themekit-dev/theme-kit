"use client";

import { useId, useRef, useState } from "react";
import { CodeBlock } from "./code-block";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

type InstallCommandEntry = {
  code: string;
  html: string;
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

/**
 * Package-manager selector.
 *
 * Implemented as a proper WAI-ARIA tablist. It previously put `aria-selected`
 * on plain `<button>`s with no `role="tab"`/`role="tablist"`, where the
 * attribute is invalid and ignored — so a screen reader announced four
 * identical buttons and never said which manager was active. Each tab now
 * carries `role="tab"`, `aria-selected` and `aria-controls`, the content is a
 * `role="tabpanel"`, and the tablist supports the standard arrow / Home / End
 * keys with a roving tabindex.
 */
export function InstallCommand({
  commands,
}: {
  commands: Record<PackageManager, InstallCommandEntry>;
}) {
  const [active, setActive] = useState<PackageManager>("pnpm");
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<PackageManager, HTMLButtonElement | null>>>(
    {},
  );

  const tabId = (manager: PackageManager) => `${baseId}-tab-${manager}`;
  const panelId = `${baseId}-panel`;

  const activate = (index: number, moveFocus: boolean) => {
    const next = MANAGERS[(index + MANAGERS.length) % MANAGERS.length];
    if (!next) return;
    setActive(next);
    if (moveFocus) tabRefs.current[next]?.focus();
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        activate(index + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        activate(index - 1, true);
        break;
      case "Home":
        event.preventDefault();
        activate(0, true);
        break;
      case "End":
        event.preventDefault();
        activate(MANAGERS.length - 1, true);
        break;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 pt-2"
      >
        {MANAGERS.map((manager, index) => {
          const isActive = manager === active;
          return (
            <button
              key={manager}
              ref={(el) => {
                tabRefs.current[manager] = el;
              }}
              id={tabId(manager)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(manager)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`mono text-xs px-3 py-1.5 rounded-t-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-b-0 border-border"
                  : "text-foreground/50 hover:text-foreground hover:bg-muted"
              }`}
            >
              {manager}
            </button>
          );
        })}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={tabId(active)}>
        <CodeBlock
          bordered={false}
          className="m-0"
          html={commands[active].html}
          code={commands[active].code}
          language="bash"
        />
      </div>
    </div>
  );
}
