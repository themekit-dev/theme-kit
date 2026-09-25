import type { ReactNode } from "react";
import { Callout } from "./callout";
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

interface CommandOption {
  name: string;
  shorthand?: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface CommandExampleProps {
  code: string;
  description?: string;
  output?: string;
}

interface CommandReferenceProps {
  name: string;
  description: string;
  synopsis: string;
  options?: CommandOption[];
  examples?: CommandExampleProps[];
  exitCodes?: Array<{ code: number; description: string }>;
  seeAlso?: Array<{ label: string; href: string }>;
  children?: ReactNode;
}

export function CommandReference({
  name,
  description,
  synopsis,
  options,
  examples,
  exitCodes,
  seeAlso,
  children,
}: CommandReferenceProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-3">{name}</h2>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
        <SimpleCodeBlock code={synopsis} language="bash" />
      </div>

      {children}

      {options && options.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Options</h3>
          <div className="space-y-4">
            {options.map((option, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="font-mono font-semibold text-sm">
                    {option.shorthand ? `${option.shorthand}, ` : ""}
                    --{option.name}
                  </code>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                    {option.type}
                  </span>
                  {option.required ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                      required
                    </span>
                  ) : null}
                  {option.default ? (
                    <span className="text-xs text-muted-foreground">
                      default: <code className="font-mono">{option.default}</code>
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {examples && examples.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Examples</h3>
          <div className="space-y-6">
            {examples.map((example, idx) => (
              <div key={idx} className="space-y-3">
                {example.description ? (
                  <p className="text-sm text-muted-foreground">
                    {example.description}
                  </p>
                ) : null}
                <SimpleCodeBlock code={example.code} language="bash" />
                {example.output ? (
                  <div className="text-xs">
                    <div className="text-muted-foreground mb-1.5">Output:</div>
                    <pre className="bg-muted/40 rounded-lg p-3 overflow-x-auto">
                      <code className="text-muted-foreground">{example.output}</code>
                    </pre>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {exitCodes && exitCodes.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Exit Codes</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-24">Code</th>
                  <th className="text-left px-4 py-2.5 font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exitCodes.map((exit, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-semibold">
                      {exit.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {exit.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {seeAlso && seeAlso.length > 0 ? (
        <Callout variant="info" title="See also">
          <ul className="space-y-1">
            {seeAlso.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="underline hover:no-underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}
    </div>
  );
}
