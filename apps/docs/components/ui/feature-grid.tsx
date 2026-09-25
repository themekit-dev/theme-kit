import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

interface FeatureItem {
  name: string;
  description?: string;
  supported: boolean | "partial";
  notes?: string;
  href?: string;
}

interface FeatureGridProps {
  features: FeatureItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FeatureGrid({
  features,
  columns = 2,
  className,
}: FeatureGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className ?? ""}`}>
      {features.map((feature, idx) => (
        <FeatureCard key={idx} {...feature} />
      ))}
    </div>
  );
}

function FeatureCard({
  name,
  description,
  supported,
  notes,
  href,
}: FeatureItem) {
  const content = (
    <div
      className={`rounded-lg border border-border p-4 transition-colors ${
        href ? "hover:bg-muted/40 cursor-pointer" : "bg-muted/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {supported === true ? (
            <Icon
              icon="lucide:check-circle"
              className="text-emerald-600 dark:text-emerald-400"
              width={20}
              height={20}
            />
          ) : supported === "partial" ? (
            <Icon
              icon="lucide:minus-circle"
              className="text-amber-600 dark:text-amber-400"
              width={20}
              height={20}
            />
          ) : (
            <Icon
              icon="lucide:x-circle"
              className="text-muted-foreground"
              width={20}
              height={20}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1">{name}</div>
          {description ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}
          {notes ? (
            <p className="text-xs text-muted-foreground/80 mt-2 italic">
              {notes}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}

interface FeatureMatrixProps {
  title?: string;
  items: Array<{
    label: string;
    value: string | boolean | ReactNode;
    type?: "text" | "boolean" | "custom";
  }>;
  className?: string;
}

export function FeatureMatrix({
  title,
  items,
  className,
}: FeatureMatrixProps) {
  return (
    <div
      className={`rounded-lg border border-border overflow-hidden ${className ?? ""}`}
    >
      {title ? (
        <div className="bg-muted/40 px-4 py-2.5 border-b border-border font-medium text-sm">
          {title}
        </div>
      ) : null}
      <div className="divide-y divide-border">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium">
              {item.type === "boolean" ? (
                item.value === true ? (
                  <Icon
                    icon="lucide:check"
                    className="text-emerald-600 dark:text-emerald-400"
                    width={18}
                    height={18}
                  />
                ) : (
                  <Icon
                    icon="lucide:x"
                    className="text-muted-foreground"
                    width={18}
                    height={18}
                  />
                )
              ) : (
                item.value
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
