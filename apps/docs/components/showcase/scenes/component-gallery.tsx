"use client";

import { Icon } from "@iconify/react";

import {
  Avatar,
  AvatarStack,
  Btn,
  Card,
  Field,
  Frame,
  PageHead,
  Pill,
  Progress,
  Segmented,
  Switch,
  TopBar,
  type CompositionProps,
} from "../ui";

function Specimen({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2 mb-2.5">
        <div className="text-[11px] font-medium">{title}</div>
        {hint ? <div className="text-[9px] text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </Card>
  );
}

export function ComponentGalleryComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="ui.acme.com/components"
      chrome={chrome}
      toolbar={<Avatar label="A" />}
    >
      <div className="h-full flex flex-col">
        <TopBar workspace="Acme UI" searchHint="Search components…" />

        <main className="flex-1 min-w-0 p-4 overflow-hidden">
          <PageHead
            breadcrumb={["Design system", "Components"]}
            title="Components"
            description="Every control reads the same semantic tokens, in both modes."
            actions={
              <>
                <Segmented options={["Preview", "Code"]} active={0} />
                <Btn variant="outline" icon="ph:swatches">
                  Tokens
                </Btn>
              </>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 mt-3.5">
            <Specimen title="Buttons" hint="5 variants">
              <div className="flex flex-wrap gap-1.5">
                <Btn>Primary</Btn>
                <Btn variant="secondary">Secondary</Btn>
                <Btn variant="outline">Outline</Btn>
                <Btn variant="ghost">Ghost</Btn>
                <Btn variant="danger">Destructive</Btn>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                <Btn size="xs">Small</Btn>
                <Btn size="sm">Medium</Btn>
                <Btn icon="ph:plus">With icon</Btn>
                <Btn variant="outline" icon="ph:download-simple">
                  Download
                </Btn>
              </div>
            </Specimen>

            <Specimen title="Badges" hint="6 tones">
              <div className="flex flex-wrap gap-1.5">
                <Pill tone="primary">Primary</Pill>
                <Pill tone="success" dot>
                  Active
                </Pill>
                <Pill tone="warning" dot>
                  Pending
                </Pill>
                <Pill tone="danger" dot>
                  Failed
                </Pill>
                <Pill tone="info">Info</Pill>
                <Pill tone="neutral">Draft</Pill>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                <Pill tone="success">Paid</Pill>
                <Pill tone="warning">Past due</Pill>
                <Pill tone="neutral">Refunded</Pill>
                <span className="text-[9px] text-muted-foreground self-center">
                  + status dots
                </span>
              </div>
            </Specimen>

            <Specimen title="Inputs" hint="4 states">
              <div className="space-y-2.5">
                <Field label="Default" value="alex@acme.com" />
                <Field label="Focused" value="alex@acme.com" focused />
                <Field
                  label="Invalid"
                  value="alex@"
                  invalid
                  hint="Enter a valid email address"
                />
                <Field label="With icon" value="acme.themekit.app" icon="ph:link-simple" />
              </div>
            </Specimen>

            <Specimen title="Alerts" hint="4 tones">
              <div className="space-y-1.5">
                {[
                  { tone: "primary", icon: "ph:info", text: "Theme synced across 3 tabs." },
                  { tone: "emerald", icon: "ph:check-circle", text: "Deploy finished in 42s." },
                  { tone: "amber", icon: "ph:warning", text: "Storage at 82% of your plan." },
                  { tone: "red", icon: "ph:x-circle", text: "Payment method expired." },
                ].map((a) => (
                  <div
                    key={a.text}
                    className={`flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[10px] ${
                      a.tone === "primary"
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : a.tone === "emerald"
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                          : a.tone === "amber"
                            ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                            : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <Icon icon={a.icon} width={11} height={11} className="mt-px shrink-0" />
                    <span className="min-w-0">{a.text}</span>
                  </div>
                ))}
              </div>
            </Specimen>

            <Specimen title="Tabs & segmented" hint="Active + idle">
              <div className="flex gap-1 border-b border-border">
                {["Overview", "Activity", "Settings", "Members"].map((t, i) => (
                  <span
                    key={t}
                    className={`text-[10px] px-2 py-1.5 -mb-px border-b-2 ${
                      i === 0
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <Segmented options={["Day", "Week", "Month"]} active={1} />
                <Segmented options={["☀", "◐", "☾"]} active={2} />
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-border space-y-2">
                {[
                  { label: "Notifications", on: true },
                  { label: "Auto-save", on: false },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-[10px]">{s.label}</span>
                    <Switch on={s.on} />
                  </div>
                ))}
              </div>
            </Specimen>

            <Specimen title="Avatars & progress" hint="Stack, ring, bars">
              <div className="flex items-center gap-3">
                <AvatarStack labels={["A", "M", "D", "K", "S", "R"]} max={4} />
                <span className="inline-flex items-center gap-1.5">
                  <Avatar label="A" />
                  <span className="text-[10px]">Alex</span>
                </span>
              </div>
              <div className="space-y-2 mt-3 pt-2.5 border-t border-border">
                {[
                  { label: "Primary", value: 72, tone: "primary" as const },
                  { label: "Success", value: 100, tone: "success" as const },
                  { label: "Warning", value: 38, tone: "warning" as const },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                      <span>{p.label}</span>
                      <span className="tabular-nums">{p.value}%</span>
                    </div>
                    <Progress value={p.value} tone={p.tone} />
                  </div>
                ))}
              </div>
            </Specimen>
          </div>
        </main>
      </div>
    </Frame>
  );
}
