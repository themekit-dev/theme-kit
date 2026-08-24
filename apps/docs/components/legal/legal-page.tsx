import type { ReactNode } from "react";
import type { Metadata } from "next";

const wrapperClass =
  "mx-auto max-w-3xl px-6 py-14 sm:py-20";

export function LegalShell({
  children,
  heading,
  updated,
  lead,
}: {
  children: ReactNode;
  heading: string;
  updated: string;
  lead: ReactNode;
}) {
  return (
    <div className={wrapperClass}>
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-2 text-sm opacity-60">Last updated: {updated}</p>
        <p className="mt-4 text-base leading-relaxed opacity-80">{lead}</p>
      </header>
      <div className="space-y-6 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-lg font-semibold tracking-tight mb-2">{heading}</h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export const legalMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
  robots: { index: true, follow: true },
});
