import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Badge } from "./compatibility-table";
import { CopyButton } from "./copy-button";

function SimpleCodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="relative group rounded-lg border border-border overflow-hidden">
      <CopyButton text={code} className="absolute top-2 right-2 z-10" />
      <pre className="bg-muted/40 p-4 overflow-x-auto text-xs">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}

type SymbolKind =
  | "function"
  | "class"
  | "interface"
  | "type"
  | "constant"
  | "variable"
  | "component";

interface ApiSymbolProps {
  name: string;
  kind: SymbolKind;
  description: string;
  signature?: string;
  package?: string;
  since?: string;
  deprecated?: boolean | string;
  experimental?: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    optional?: boolean;
    default?: string;
    description: string;
  }>;
  returns?: {
    type: string;
    description: string;
  };
  examples?: Array<{
    title?: string;
    code: string;
    language?: string;
  }>;
  seeAlso?: Array<{ label: string; href: string }>;
  children?: ReactNode;
}

const kindIcons: Record<SymbolKind, string> = {
  function: "lucide:function-square",
  class: "lucide:box",
  interface: "lucide:file-type",
  type: "lucide:file-code",
  constant: "lucide:lock",
  variable: "lucide:variable",
  component: "lucide:component",
};

export function ApiSymbol({
  name,
  kind,
  description,
  signature,
  package: pkg,
  since,
  deprecated,
  experimental,
  parameters,
  returns,
  examples,
  seeAlso,
  children,
}: ApiSymbolProps) {
  return (
    <div className="space-y-6 py-6 border-b border-border last:border-0" id={name}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon
              icon={kindIcons[kind]}
              className="text-muted-foreground flex-shrink-0"
              width={20}
              height={20}
            />
            <h3 className="text-xl font-bold font-mono">{name}</h3>
          </div>
          <a
            href={`#${name}`}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Permalink"
          >
            <Icon icon="lucide:link" width={18} height={18} />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="default">{kind}</Badge>
          {pkg ? (
            <code className="px-2 py-1 rounded bg-muted/60 text-foreground font-mono">
              {pkg}
            </code>
          ) : null}
          {since ? (
            <span className="text-muted-foreground">Since {since}</span>
          ) : null}
          {experimental ? (
            <Badge variant="warning">Experimental</Badge>
          ) : null}
          {deprecated ? (
            <Badge variant="warning">
              Deprecated{typeof deprecated === "string" ? `: ${deprecated}` : ""}
            </Badge>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {signature ? (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Signature
          </div>
          <SimpleCodeBlock code={signature} language="typescript" />
        </div>
      ) : null}

      {parameters && parameters.length > 0 ? (
        <div>
          <div className="text-sm font-semibold mb-3">Parameters</div>
          <div className="space-y-3">
            {parameters.map((param, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border p-3 space-y-1.5"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono font-semibold text-sm">
                    {param.name}
                  </code>
                  {param.optional ? (
                    <span className="text-xs text-muted-foreground">optional</span>
                  ) : null}
                  <code className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                    {param.type}
                  </code>
                  {param.default ? (
                    <span className="text-xs text-muted-foreground">
                      default: <code className="font-mono">{param.default}</code>
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {param.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {returns ? (
        <div>
          <div className="text-sm font-semibold mb-3">Returns</div>
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <code className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
              {returns.type}
            </code>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {returns.description}
            </p>
          </div>
        </div>
      ) : null}

      {children}

      {examples && examples.length > 0 ? (
        <div>
          <div className="text-sm font-semibold mb-3">Examples</div>
          <div className="space-y-4">
            {examples.map((example, idx) => (
              <div key={idx} className="space-y-2">
                {example.title ? (
                  <div className="text-xs font-medium text-muted-foreground">
                    {example.title}
                  </div>
                ) : null}
                <SimpleCodeBlock
                  code={example.code}
                  language={example.language ?? "typescript"}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {seeAlso && seeAlso.length > 0 ? (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            See also
          </div>
          <div className="flex flex-wrap gap-2">
            {seeAlso.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-xs px-2 py-1 rounded border border-border hover:bg-muted/40 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
