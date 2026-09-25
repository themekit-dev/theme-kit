"use client";

import { Icon } from "@iconify/react";
import { Button } from "../ui/button";
import { PickCard } from "../ui/pick-card";
import { NextSteps } from "../ui/next-step-card";
import { Callout } from "../ui/callout";

const pathwayIcons = {
  quick: "lucide:zap",
  custom: "lucide:palette",
  framework: "lucide:settings",
  library: "lucide:package",
};

const useCaseIcons = {
  "fastest": "lucide:rocket",
  "custom": "lucide:palette",
  "library": "lucide:package",
  "zero": "lucide:zap",
};

const pathways = [
  {
    id: "quick",
    icon: "lightning",
    title: "Quick Start",
    description: "Install and toggle themes in under 2 minutes using built-in themes",
    time: "2 min",
    href: "/quick-start",
    recommended: true,
    badges: ["Beginner-friendly", "No config"],
  },
  {
    id: "custom",
    icon: "palette",
    title: "Custom Themes",
    description: "Define your own design tokens and create branded theme families",
    time: "10 min",
    href: "/custom-themes",
    badges: ["Full control", "Design tokens"],
  },
  {
    id: "framework",
    icon: "settings",
    title: "Framework Guide",
    description: "Deep dive into SSR, zero-flash, and framework-specific patterns",
    time: "15 min",
    href: "/framework-guides",
    badges: ["Advanced", "Production-ready"],
  },
  {
    id: "library",
    icon: "package",
    title: "Library Integration",
    description: "Integrate with shadcn/ui, Bootstrap, daisyUI, or other UI libraries",
    time: "5 min",
    href: "/libraries",
    badges: ["Pre-built", "Drop-in"],
  },
];

const useCases = [
  {
    title: "I want the fastest setup",
    description: "Get themes working immediately with zero configuration",
    href: "/quick-start",
    iconKey: "fastest",
  },
  {
    title: "I need custom brand colors",
    description: "Define your own palette and design system",
    href: "/custom-themes",
    iconKey: "custom",
  },
  {
    title: "I'm using a UI library",
    description: "Connect Theme Kit to shadcn/ui, Bootstrap, daisyUI, etc.",
    href: "/libraries",
    iconKey: "library",
  },
  {
    title: "I need zero-flash SSR",
    description: "Server-side rendering without theme flicker",
    href: "/framework-guides/next",
    iconKey: "zero",
  },
];

export function GetStartedRouter() {
  return (
    <div>
      <section className="mb-12">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Choose your path
        </h2>
        <p className="opacity-70 text-sm mb-6 max-w-2xl">
          Theme Kit adapts to your workflow. Pick the guide that matches where
          you are and what you need.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {pathways.map((path) => (
            <a
              key={path.id}
              href={path.href}
              className="group block rounded-xl border border-border bg-card hover:border-ring transition-all p-5 no-underline"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon
                  icon={pathwayIcons[path.id as keyof typeof pathwayIcons]}
                  className="text-3xl shrink-0"
                  aria-label={path.title}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {path.title}
                    </h3>
                    {path.recommended && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed mb-3">
                    {path.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {path.time}
                    </span>
                    {path.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Not sure where to start?
        </h2>
        <div className="grid gap-3">
          {useCases.map((useCase) => (
            <a
              key={useCase.title}
              href={useCase.href}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card hover:border-ring transition-all p-4 no-underline"
            >
              <Icon
                icon={useCaseIcons[useCase.iconKey as keyof typeof useCaseIcons]}
                className="text-2xl shrink-0"
                aria-label={useCase.title}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors mb-0.5">
                  {useCase.title}
                </h3>
                <p className="text-xs opacity-60">{useCase.description}</p>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Which packages do I need?
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm opacity-70 leading-relaxed mb-4">
            Every Theme Kit setup needs <span className="mono font-semibold">@theme-kit/core</span> plus
            your framework adapter. Library adapters (shadcn/ui, Bootstrap, daisyUI, etc.) are optional.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="font-semibold text-sm mb-1">Framework packages</div>
              <div className="text-xs opacity-60 mb-2">Required for your stack</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/next</span>
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/react</span>
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/vue</span>
                <span className="text-xs opacity-60">+ 8 more</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="font-semibold text-sm mb-1">Library adapters</div>
              <div className="text-xs opacity-60 mb-2">Optional UI integrations</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/shadcn</span>
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/mui</span>
                <span className="mono text-[10px] px-2 py-1 rounded bg-secondary text-secondary-foreground">@theme-kit/daisyui</span>
                <span className="text-xs opacity-60">+ 6 more</span>
              </div>
            </div>
          </div>
          <Button href="/choose-package" variant="ghost" size="sm">
            Full package decision guide →
          </Button>
        </div>
      </section>

      <Callout title="All paths lead to the same powerful runtime" className="mb-12">
        <p className="text-sm leading-relaxed">
          Whether you start with Quick Start or dive straight into custom
          themes, you get the same core: semantic tokens, theme families,
          mode switching, persistence, history, and cross-window sync. The
          difference is just how much you configure up front.
        </p>
      </Callout>

      <NextSteps
        title="After setup"
        steps={[
          {
            title: "Explore interactive tools",
            description: "Theme Studio, Playground, and Accessibility Lab",
            href: "/playground",
          },
          {
            title: "Learn core concepts",
            description: "Tokens, families, modes, and persistence",
            href: "/core-concepts",
          },
          {
            title: "Browse framework guides",
            description: "Framework-specific patterns and best practices",
            href: "/framework-guides",
          },
        ]}
      />
    </div>
  );
}
