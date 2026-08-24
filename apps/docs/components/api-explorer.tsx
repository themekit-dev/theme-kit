"use client";

import { useState } from "react";
import { Callout } from "./ui/callout";

type Feature = { name: string; desc: string };
type Group = { label: string; features: Feature[] };

export function ApiExplorer({
  groups,
  slug,
}: {
  groups: Group[];
  slug: string;
}) {
  const [selected, setSelected] = useState<Record<string, string | null>>({});

  function toggle(group: string, name: string) {
    setSelected((prev) => ({
      ...prev,
      [group]: prev[group] === name ? null : name,
    }));
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, groupIndex) => {
        const activeName = selected[group.label];
        const active = group.features.find((f) => f.name === activeName);
        return (
          <div
            key={`${group.label}-${groupIndex}`}
            className="rounded-xl border border-border p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.features.map((feature) => {
                const isActive = activeName === feature.name;
                return (
                  <button
                    key={feature.name}
                    type="button"
                    onClick={() => toggle(group.label, feature.name)}
                    aria-expanded={isActive}
                    className={`chip ${isActive ? "chip-active" : ""}`}
                  >
                    <code className="mono">{feature.name}</code>
                  </button>
                );
              })}
            </div>

            <div
              className={`grid transition-all duration-300 ease-out ${
                active
                  ? "grid-rows-[1fr] opacity-100 mt-3"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <Callout>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--theme-color-primary)" }}
                  >
                    {active?.name}
                  </span>
                  <span className="opacity-80"> — {active?.desc}</span>
                </Callout>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
