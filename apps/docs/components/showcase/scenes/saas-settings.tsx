"use client";

import { Icon } from "@iconify/react";

import {
  Avatar,
  AvatarStack,
  Btn,
  Card,
  CardHead,
  Field,
  Frame,
  PageHead,
  PersonCell,
  Pill,
  Progress,
  Segmented,
  SideNav,
  Switch,
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
      { label: "General", icon: "ph:sliders" },
      { label: "Members", icon: "ph:users-three", badge: "8" },
      { label: "Billing", icon: "ph:credit-card" },
      { label: "Integrations", icon: "ph:plugs-connected" },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Authentication", icon: "ph:shield-check" },
      { label: "API keys", icon: "ph:key" },
      { label: "Audit log", icon: "ph:list-magnifying-glass" },
    ],
  },
];

const MEMBERS = [
  { name: "Alex Rivera", meta: "alex@acme.com", role: "Owner", status: "Active" },
  { name: "Mira Chen", meta: "mira@acme.com", role: "Admin", status: "Active" },
  { name: "Devon Park", meta: "devon@acme.com", role: "Member", status: "Active" },
  { name: "Ken Ito", meta: "ken@vertex.dev", role: "Member", status: "Invited" },
];

const ROLE_TONE = { Owner: "primary", Admin: "info", Member: "neutral" } as const;

export function SaasSettingsComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="app.acme.com/settings/general"
      chrome={chrome}
      toolbar={<Avatar label="A" />}
    >
      <div className="h-full flex flex-col">
        <TopBar searchHint="Search settings…" />

        <div className="flex-1 min-h-0 flex">
          <SideNav
            groups={NAV}
            active="General"
            footer={
              <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
                <Avatar label="A" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium truncate">Acme Inc</div>
                  <div className="text-[9px] text-muted-foreground truncate">Pro · 8 seats</div>
                </div>
              </div>
            }
          />

          <main className="flex-1 min-w-0 p-4 overflow-hidden">
            <PageHead
              breadcrumb={["Settings", "General"]}
              title="Workspace settings"
              description="Manage your workspace, appearance and team."
              actions={
                <>
                  <Btn variant="ghost">Discard</Btn>
                  <Btn icon="ph:check">Save changes</Btn>
                </>
              }
            />

            <div className="flex gap-1 border-b border-border mt-3.5 mb-3">
              {["General", "Appearance", "Notifications", "Billing", "Team"].map((t, i) => (
                <span
                  key={t}
                  className={`text-[11px] px-2.5 py-1.5 -mb-px border-b-2 ${
                    i === 1
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-2.5">
              <div className="space-y-2.5">
                <Card>
                  <CardHead title="Workspace" hint="Visible to everyone in your organization." />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Workspace name" value="Acme Inc" focused />
                    <Field label="Workspace URL" value="acme" icon="ph:link-simple" hint="acme.themekit.app" />
                  </div>
                </Card>

                <Card>
                  <CardHead
                    title="Appearance"
                    hint="How the interface looks for you."
                    right={<Pill tone="primary">Synced</Pill>}
                  />
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium">Interface theme</div>
                        <div className="text-[10px] text-muted-foreground">
                          Follows the theme selected on this page.
                        </div>
                      </div>
                      <Segmented options={["☀", "◐", "☾"]} active={1} />
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium">Density</div>
                        <div className="text-[10px] text-muted-foreground">
                          Compact rows show more data per screen.
                        </div>
                      </div>
                      <Segmented options={["Comfortable", "Compact"]} active={0} />
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium">Reduce motion</div>
                        <div className="text-[10px] text-muted-foreground">
                          Disable transitions between themes.
                        </div>
                      </div>
                      <Switch on={false} />
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium">Sync across tabs</div>
                        <div className="text-[10px] text-muted-foreground">
                          Apply changes to every open tab.
                        </div>
                      </div>
                      <Switch on />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-2.5">
                <Card>
                  <CardHead title="Plan" right={<Pill tone="primary">Pro</Pill>} />
                  <div className="text-[19px] font-semibold tabular-nums leading-none">
                    $24
                    <span className="text-[11px] font-normal text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Renews 12 Oct · 8 of 10 seats used
                  </div>
                  <div className="mt-2">
                    <Progress value={80} />
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <Btn variant="outline">Manage billing</Btn>
                    <Btn variant="ghost">Invoices</Btn>
                  </div>
                </Card>

                <Card>
                  <CardHead
                    title="Team"
                    right={<span className="text-[10px] text-primary">Invite</span>}
                  />
                  <AvatarStack labels={["A", "M", "D", "K", "S", "R"]} max={5} />
                  <div className="text-[10px] text-muted-foreground mt-2">
                    6 active · 1 invited · 2 seats left
                  </div>
                </Card>

                <Card>
                  <CardHead title="Usage" hint="This billing period" />
                  <ul className="space-y-2 m-0 p-0 list-none">
                    {[
                      { label: "API calls", value: 72 },
                      { label: "Storage", value: 34 },
                      { label: "Build minutes", value: 51 },
                    ].map((u) => (
                      <li key={u.label}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>{u.label}</span>
                          <span className="tabular-nums text-muted-foreground">{u.value}%</span>
                        </div>
                        <Progress value={u.value} tone={u.value > 70 ? "warning" : "primary"} />
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>

            <div className="mt-2.5">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Member</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map((m) => (
                    <tr key={m.name}>
                      <Td>
                        <PersonCell name={m.name} meta={m.meta} />
                      </Td>
                      <Td>
                        <Pill tone={ROLE_TONE[m.role as keyof typeof ROLE_TONE]}>{m.role}</Pill>
                      </Td>
                      <Td>
                        <Pill tone={m.status === "Active" ? "success" : "warning"} dot>
                          {m.status}
                        </Pill>
                      </Td>
                      <Td align="right">
                        <Icon
                          icon="ph:dots-three"
                          width={12}
                          height={12}
                          className="text-muted-foreground inline-block"
                        />
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
