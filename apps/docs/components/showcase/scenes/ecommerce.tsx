"use client";

import { Icon } from "@iconify/react";

import {
  Btn,
  Card,
  CardHead,
  Frame,
  Pill,
  Progress,
  type CompositionProps,
} from "../ui";

const CATEGORIES = ["All", "Lighting", "Kitchen", "Textiles", "Ceramics", "Storage"];

const PRODUCTS = [
  {
    name: "Aurora Desk Lamp",
    category: "Lighting",
    price: "$128",
    was: "$160",
    rating: 4.8,
    reviews: 214,
    badge: "New" as const,
    icon: "ph:lamp",
    tint: "from-primary/25",
  },
  {
    name: "Kettle No. 4",
    category: "Kitchen",
    price: "$86",
    rating: 4.6,
    reviews: 132,
    badge: null,
    icon: "ph:coffee",
    tint: "from-primary/15",
  },
  {
    name: "Slate Mug Set",
    category: "Ceramics",
    price: "$42",
    was: "$58",
    rating: 4.9,
    reviews: 388,
    badge: "Sale" as const,
    icon: "ph:cup",
    tint: "from-primary/20",
  },
  {
    name: "Linen Throw",
    category: "Textiles",
    price: "$164",
    rating: 4.7,
    reviews: 96,
    badge: null,
    icon: "ph:bed",
    tint: "from-primary/10",
  },
  {
    name: "Oak Wall Shelf",
    category: "Storage",
    price: "$212",
    rating: 4.5,
    reviews: 41,
    badge: null,
    icon: "ph:wall",
    tint: "from-primary/18",
  },
  {
    name: "Stone Carafe",
    category: "Ceramics",
    price: "$64",
    rating: 4.4,
    reviews: 77,
    badge: null,
    icon: "ph:drop",
    tint: "from-primary/22",
  },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          icon={
            i < full
              ? "ph:star-fill"
              : i === full && half
                ? "ph:star-half-fill"
                : "ph:star"
          }
          width={9}
          height={9}
          className={i < full || (i === full && half) ? "text-amber-500" : "text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

export function EcommerceComposition({ chrome = true }: CompositionProps = {}) {
  return (
    <Frame
      title="shop.acme.com/collections/all"
      chrome={chrome}
      toolbar={
        <div className="flex items-center gap-2">
          <Icon icon="ph:shopping-cart-simple" width={12} height={12} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">2</span>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* storefront header */}
        <div className="h-11 shrink-0 flex items-center gap-4 px-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-5 h-5 rounded-md bg-primary" aria-hidden />
            <span className="text-[12px] font-semibold tracking-tight">Acme Store</span>
          </div>
          <nav className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
            {["New in", "Lighting", "Kitchen", "Textiles", "Sale"].map((n, i) => (
              <span key={n} className={i === 3 ? "text-primary font-medium" : ""}>
                {n}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
              <Icon icon="ph:magnifying-glass" width={11} height={11} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Search products</span>
            </span>
            <span className="relative grid place-items-center w-7 h-7 rounded-md border border-border">
              <Icon icon="ph:shopping-cart-simple" width={13} height={13} />
              <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-[8px] font-semibold">
                2
              </span>
            </span>
          </div>
        </div>

        <main className="flex-1 min-w-0 overflow-hidden">
          {/* promo band */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/15 via-card to-card">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Pill tone="primary">Autumn edit</Pill>
                <span className="text-[9px] text-muted-foreground">Ends Sunday</span>
              </div>
              <div className="text-[13px] font-semibold mt-1 truncate">
                Objects for calmer rooms
              </div>
              <div className="text-[10px] text-muted-foreground">
                Free shipping over $80 · 30-day returns
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Btn variant="outline">Browse the edit</Btn>
              <Btn icon="ph:arrow-right">Shop now</Btn>
            </div>
          </div>

          {/* filter row */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {CATEGORIES.map((c, i) => (
                <span
                  key={c}
                  className={`text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap ${
                    i === 0
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Icon icon="ph:sliders-horizontal" width={11} height={11} />
                Filters
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                Sort: Featured
                <Icon icon="ph:caret-down" width={8} height={8} />
              </span>
            </div>
          </div>

          <div className="p-4 flex gap-4">
            {/* product grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="text-[11px] text-muted-foreground">
                  <span className="text-foreground font-medium">248</span> products
                </span>
                <span className="text-[10px] text-muted-foreground">Free returns on all orders</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {PRODUCTS.map((p) => (
                  <div
                    key={p.name}
                    className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  >
                    <div
                      className={`relative h-28 bg-gradient-to-br ${p.tint} to-transparent grid place-items-center`}
                    >
                      <Icon icon={p.icon} width={30} height={30} className="text-primary/60" />
                      {p.badge ? (
                        <span className="absolute left-2 top-2">
                          <Pill tone={p.badge === "Sale" ? "danger" : "primary"}>{p.badge}</Pill>
                        </span>
                      ) : null}
                      <span className="absolute right-2 top-2 grid place-items-center w-6 h-6 rounded-full bg-card/90 border border-border">
                        <Icon
                          icon="ph:heart"
                          width={11}
                          height={11}
                          className="text-muted-foreground"
                        />
                      </span>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </div>
                      <div className="text-[11px] font-medium truncate">{p.name}</div>
                      <div className="flex items-center gap-1.5">
                        <Stars rating={p.rating} />
                        <span className="text-[9px] text-muted-foreground">
                          {p.rating} ({p.reviews})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-auto pt-1">
                        <span className="text-[13px] font-semibold tabular-nums">{p.price}</span>
                        {p.was ? (
                          <span className="text-[10px] text-muted-foreground line-through tabular-nums">
                            {p.was}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-center py-1.5 rounded-md border border-border text-muted-foreground">
                        Add to cart
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* cart summary */}
            <aside className="hidden lg:block w-52 shrink-0">
              <Card>
                <CardHead
                  title="Your cart"
                  hint="2 items"
                  right={<span className="text-[10px] text-primary">Edit</span>}
                />
                <ul className="space-y-2 m-0 p-0 list-none">
                  {[
                    { name: "Slate Mug Set", qty: 1, price: "$42", icon: "ph:cup" },
                    { name: "Aurora Desk Lamp", qty: 1, price: "$128", icon: "ph:lamp" },
                  ].map((i) => (
                    <li key={i.name} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-md bg-muted grid place-items-center shrink-0">
                        <Icon icon={i.icon} width={14} height={14} className="text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] truncate">{i.name}</div>
                        <div className="text-[9px] text-muted-foreground">Qty {i.qty}</div>
                      </div>
                      <span className="text-[10px] tabular-nums shrink-0">{i.price}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-2.5 border-t border-border space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">$170.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold pt-1">
                    <span>Total</span>
                    <span className="tabular-nums">$170.00</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                    <span>$80 to free express</span>
                    <span>reached</span>
                  </div>
                  <Progress value={100} tone="success" />
                </div>

                <div className="mt-3">
                  <span className="block text-center text-[11px] font-medium py-1.5 rounded-md bg-primary text-primary-foreground">
                    Checkout
                  </span>
                </div>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </Frame>
  );
}
