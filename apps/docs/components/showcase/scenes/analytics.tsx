"use client";

import { Icon } from "@iconify/react";

import {
  AreaChart,
  AvatarStack,
  Btn,
  Card,
  CardHead,
  Donut,
  Frame,
  Kpi,
  PageHead,
  Pill,
  Progress,
  Segmented,
  SideNav,
  Sparkline,
  TableWrap,
  Td,
  Th,
  TopBar,
  type CompositionProps,
} from "../ui";

const NAV = [
  {
    items: [
      { label: "Overview", icon: "ph:chart-pie-slice" },
      { label: "Acquisition", icon: "ph:megaphone" },
      { label: "Engagement", icon: "ph:cursor-click" },
      { label: "Retention", icon: "ph:repeat" },
      { label: "Reports", icon: "ph:file-text" },
    ],
  },
];

const FUNNEL = [
  { step: "Visited", value: 94_120, pct: 100, tone: "primary" as const },
  { step: "Signed up", value: 18_640, pct: 20, tone: "primary" as const },
  { step: "Activated", value: 7_410, pct: 8, tone: "warning" as const },
  { step: "Subscribed", value: 3_580, pct: 4, tone: "success" as const },
];

const SOURCES = [
  { src: "google / organic", visits: "48,201", conv: "3.4%", delta: "+8%", trend: [12, 15, 14, 18, 17, 21, 20, 24] },
  { src: "news.ycombinator", visits: "12,884", conv: "5.1%", delta: "+21%", trend: [4, 9, 6, 14, 11, 18, 16, 22] },
  { src: "producthunt", visits: "9,140", conv: "2.2%", delta: "-6%", trend: [16, 14, 15, 12, 11, 10, 9, 8] },
  { src: "reddit.com", visits: "7,502", conv: "4.0%", delta: "+3%", trend: [8, 9, 8, 10, 9, 11, 10, 12] },
  { src: "twitter.com", visits: "5,318", conv: "1.6%", delta: "-2%", trend: [10, 9, 10, 8, 9, 7, 8, 7] },
];

const DEVICES = [
  { name: "Desktop", value: 52, className: "stroke-primary" },
  { name: "Mobile", value: 34, className: "stroke-emerald-500" },
  { name: "Tablet", value: 14, className: "stroke-amber-500" },
];

export function AnalyticsComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="analytics.acme.com/acquisition"
      chrome={chrome}
      toolbar={
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Live</span>
          <AvatarStack labels={["A", "M", "D"]} />
        </div>
      }
    >
      <div className="h-full flex flex-col">
        <TopBar workspace="Acme Analytics" searchHint="Search events, users, funnels…" />

        <div className="flex-1 min-h-0 flex">
          <SideNav
            groups={NAV}
            active="Acquisition"
            width="w-40"
            footer={
              <div className="flex items-center gap-1.5 px-1.5 py-1 text-[9px] text-muted-foreground">
                <Icon icon="ph:clock-counter-clockwise" width={11} height={11} />
                Synced 4m ago
              </div>
            }
          />

          <main className="flex-1 min-w-0 p-4 overflow-hidden">
            <PageHead
              breadcrumb={["Analytics", "Acquisition"]}
              title="Acquisition"
              description="Where new users come from, and how many convert."
              actions={
                <>
                  <Segmented options={["7d", "30d", "90d"]} active={1} />
                  <Btn variant="outline" icon="ph:funnel-simple">
                    Filter
                  </Btn>
                  <Btn icon="ph:download-simple">Export</Btn>
                </>
              }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5">
              <Kpi label="Sessions" value="94,120" delta="8.2%" trend={[20, 24, 22, 28, 31, 29, 34, 38]} />
              <Kpi label="Bounce rate" value="32.4%" delta="2.1%" up={false} trend={[40, 38, 39, 35, 33, 34, 31, 30]} />
              <Kpi label="Avg. session" value="4m 12s" delta="6.7%" trend={[22, 25, 24, 27, 30, 29, 33, 35]} />
              <Kpi label="Conversion" value="3.8%" delta="0.9%" trend={[14, 15, 14, 17, 16, 19, 18, 21]} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-2.5 mt-2.5">
              <Card>
                <CardHead
                  title="Traffic"
                  hint="Sessions vs. previous period"
                  right={
                    <span className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-0.5 rounded-full bg-primary" />
                        This period
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-0.5 rounded-full bg-muted-foreground/40" />
                        Previous
                      </span>
                    </span>
                  }
                />
                <div className="relative">
                  <AreaChart
                    data={[12, 18, 15, 24, 21, 30, 27, 36, 33, 42, 39, 48]}
                    height={110}
                    highlight={9}
                  />
                  {/* Tooltip on the highlighted point, as if hovered. */}
                  <div className="absolute left-[70%] top-0 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 shadow-sm">
                    <div className="text-[9px] text-muted-foreground">Oct 8</div>
                    <div className="text-[11px] font-semibold tabular-nums">42,180</div>
                  </div>
                </div>
                <div className="flex justify-between mt-1.5 text-[8px] text-muted-foreground">
                  {["Sep 12", "Sep 22", "Oct 2", "Oct 12"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Funnel" hint="Last 30 days" />
                <ul className="space-y-2 m-0 p-0 list-none">
                  {FUNNEL.map((f) => (
                    <li key={f.step}>
                      <div className="flex items-baseline justify-between text-[10px] mb-1">
                        <span className="truncate">{f.step}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {f.value.toLocaleString("en-US")}
                        </span>
                      </div>
                      <Progress value={f.pct} tone={f.tone} />
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-2.5 mt-2.5">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Source</Th>
                    <Th align="right" sort="desc">
                      Visits
                    </Th>
                    <Th align="right">Conv.</Th>
                    <Th align="right">Δ</Th>
                    <Th align="right">Trend</Th>
                  </tr>
                </thead>
                <tbody>
                  {SOURCES.map((s) => (
                    <tr key={s.src}>
                      <Td>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" aria-hidden />
                          <span className="font-mono text-[10px]">{s.src}</span>
                        </span>
                      </Td>
                      <Td align="right">{s.visits}</Td>
                      <Td align="right">{s.conv}</Td>
                      <Td align="right">
                        <span
                          className={
                            s.delta.startsWith("+")
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {s.delta}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="inline-block w-12">
                          <Sparkline data={s.trend} className="h-3.5" />
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <Card>
                <CardHead title="Devices" hint="Share of sessions" />
                <div className="flex items-center gap-4">
                  <Donut
                    segments={DEVICES}
                    center={<span className="text-[11px] font-semibold">94k</span>}
                  />
                  <ul className="space-y-1.5 m-0 p-0 list-none flex-1 min-w-0">
                    {DEVICES.map((d) => (
                      <li key={d.name} className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className={`w-2 h-2 rounded-sm shrink-0 ${
                            d.name === "Desktop"
                              ? "bg-primary"
                              : d.name === "Mobile"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                          }`}
                          aria-hidden
                        />
                        <span className="flex-1 truncate">{d.name}</span>
                        <span className="tabular-nums text-muted-foreground">{d.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </Frame>
  );
}
