"use client";

import { Icon } from "@iconify/react";

import {
  Avatar,
  BarChart,
  Btn,
  Card,
  CardHead,
  Frame,
  Kpi,
  PageHead,
  PersonCell,
  Pill,
  Segmented,
  SideNav,
  TableWrap,
  Td,
  Th,
  TopBar,
  type CompositionProps,
} from "../ui";

const NAV = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: "ph:squares-four" },
      { label: "Analytics", icon: "ph:chart-line-up" },
      { label: "Customers", icon: "ph:users" },
      { label: "Projects", icon: "ph:folder", badge: "4" },
      { label: "Invoices", icon: "ph:receipt" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Settings", icon: "ph:gear-six" },
      { label: "Integrations", icon: "ph:plugs-connected" },
      { label: "Help", icon: "ph:question" },
    ],
  },
];

const ORDERS = [
  { name: "Mira Chen", meta: "mira@acme.com", plan: "Pro", amount: "$1,240", status: "Paid" },
  { name: "Devon Park", meta: "devon@acme.com", plan: "Team", amount: "$860", status: "Paid" },
  { name: "Ana Ruiz", meta: "ana@northwind.io", plan: "Pro", amount: "$2,410", status: "Pending" },
  { name: "Ken Ito", meta: "ken@vertex.dev", plan: "Starter", amount: "$120", status: "Refunded" },
];

const ACTIVITY = [
  { icon: "ph:plus-circle", tone: "text-emerald-500", text: "Mira created project", at: "2m" },
  { icon: "ph:pencil-simple", tone: "text-primary", text: "You updated billing", at: "18m" },
  { icon: "ph:user-plus", tone: "text-amber-500", text: "Devon invited 3 members", at: "1h" },
  { icon: "ph:rocket-launch", tone: "text-primary", text: "Deployed v2.4 to prod", at: "3h" },
  { icon: "ph:check-circle", tone: "text-emerald-500", text: "Invoice #4021 paid", at: "5h" },
];

const STATUS_TONE = { Paid: "success", Pending: "warning", Refunded: "neutral" } as const;

export function DashboardComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="app.acme.com/overview"
      chrome={chrome}
      toolbar={
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 grid place-items-center rounded-md border border-border text-[10px] text-muted-foreground">
            ◐
          </span>
          <Avatar label="A" />
        </div>
      }
    >
      <div className="h-full flex flex-col">
        <TopBar searchHint="Search projects, customers…" />

        <div className="flex-1 min-h-0 flex">
          <SideNav
            groups={NAV}
            active="Overview"
            footer={
              <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
                <Avatar label="A" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium truncate">Alex Rivera</div>
                  <div className="text-[9px] text-muted-foreground truncate">Owner</div>
                </div>
                <Icon icon="ph:caret-up-down" width={9} height={9} className="text-muted-foreground" />
              </div>
            }
          />

          <main className="flex-1 min-w-0 p-4 overflow-hidden">
            <PageHead
              breadcrumb={["Workspace", "Overview"]}
              title="Good morning, Alex"
              description="3 new orders and 2 mentions since yesterday."
              actions={
                <>
                  <Segmented options={["7d", "30d", "90d"]} active={1} />
                  <Btn variant="outline" icon="ph:download-simple">
                    Export
                  </Btn>
                  <Btn icon="ph:plus">New</Btn>
                </>
              }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5">
              <Kpi
                label="Revenue"
                value="$84,290"
                delta="12.4%"
                trend={[18, 24, 20, 31, 27, 38, 34, 45]}
              />
              <Kpi
                label="Active users"
                value="12,842"
                delta="3.1%"
                trend={[30, 32, 29, 35, 38, 36, 41, 44]}
              />
              <Kpi
                label="Orders"
                value="2,491"
                delta="1.8%"
                up={false}
                trend={[40, 38, 41, 36, 34, 35, 31, 30]}
              />
              <Kpi
                label="Churn"
                value="1.8%"
                delta="0.4%"
                trend={[22, 20, 21, 18, 17, 16, 15, 14]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-2.5 mt-2.5">
              <Card>
                <CardHead
                  title="Revenue"
                  hint="Net of refunds · updated 4 minutes ago"
                  right={<Segmented options={["Revenue", "Orders"]} active={0} />}
                />
                <BarChart
                  data={[38, 52, 44, 66, 58, 74, 62, 81, 70, 88, 76, 94]}
                  height={104}
                  labels={["Jan", "Mar", "May", "Jul", "Sep", "Nov"]}
                  emphasise={11}
                />
              </Card>

              <Card>
                <CardHead
                  title="Activity"
                  hint="Live feed"
                  right={
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400">
                      <span className="w-1 h-1 rounded-full bg-current" />
                      live
                    </span>
                  }
                />
                <ul className="space-y-1.5 m-0 p-0 list-none">
                  {ACTIVITY.map((a) => (
                    <li key={a.text} className="flex items-start gap-1.5">
                      <Icon
                        icon={a.icon}
                        className={`mt-0.5 shrink-0 ${a.tone}`}
                        width={11}
                        height={11}
                      />
                      <span className="flex-1 min-w-0 text-[10px] truncate">{a.text}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{a.at}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="mt-2.5">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Customer</Th>
                    <Th>Plan</Th>
                    <Th align="right" sort="desc">
                      Amount
                    </Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o) => (
                    <tr key={o.name}>
                      <Td>
                        <PersonCell name={o.name} meta={o.meta} />
                      </Td>
                      <Td>
                        <Pill tone={o.plan === "Pro" ? "primary" : "neutral"}>{o.plan}</Pill>
                      </Td>
                      <Td align="right">{o.amount}</Td>
                      <Td>
                        <Pill tone={STATUS_TONE[o.status as keyof typeof STATUS_TONE]} dot>
                          {o.status}
                        </Pill>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </main>
        </div>
      </div>
    </Frame>
  );
}
