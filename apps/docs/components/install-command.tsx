"use client";

import { useState } from "react";
import { CodeBlock } from "./code-block";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

type InstallCommandEntry = {
  code: string;
  html: string;
};

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

export function InstallCommand({
  commands,
}: {
  commands: Record<PackageManager, InstallCommandEntry>;
}) {
  const [active, setActive] = useState<PackageManager>("pnpm");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 pt-2">
        {MANAGERS.map((manager) => {
          const isActive = manager === active;
          return (
            <button
              key={manager}
              type="button"
              onClick={() => setActive(manager)}
              aria-selected={isActive}
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
      <CodeBlock
        bordered={false}
        className="m-0"
        html={commands[active].html}
        code={commands[active].code}
        language="bash"
      />
    </div>
  );
}
