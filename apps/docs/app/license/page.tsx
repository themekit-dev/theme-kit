import {
  LegalShell,
  LegalSection,
  LegalList,
  legalMetadata,
} from "../../components/legal/legal-page";
import { GITHUB_LICENSE, GITHUB_URL } from "../../lib/site";

export const metadata = legalMetadata(
  "License",
  "Theme Kit is MIT-licensed open source software. What that means and where to read the full text.",
);

const updated = "August 24, 2026";

export default function LicensePage() {
  return (
    <LegalShell
      heading="License"
      updated={updated}
      lead={
        <>
          Theme Kit is free, open source software distributed under the{" "}
          <strong>MIT License</strong>.
        </>
      }
    >
      <LegalSection id="mit" heading="What the MIT License means">
        <LegalList
          items={[
            <>
              <strong>Use it freely</strong> — in personal projects, commercial
              products, internal tools, anything.
            </>,
            <>
              <strong>Modify and redistribute</strong> — fork it, patch it,
              bundle it, publish derived works.
            </>,
            <>
              <strong>Keep the copyright notice</strong> — the license
              requires including the copyright and permission notice in
              substantial portions of the software.
            </>,
            <>
              <strong>No warranty</strong> — the software is provided
              &ldquo;as is&rdquo;, without warranty of any kind.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="full-text" heading="Full license text">
        <p>
          The complete license text is in the repository:
        </p>
        <p>
          <a href={GITHUB_LICENSE} className="underline">
            github.com/themekit-dev/theme-kit/LICENSE
          </a>
        </p>
      </LegalSection>

      <LegalSection id="docs-content" heading="Documentation content">
        <p>
          The documentation and code examples on this site are part of the
          project. Code examples are MIT-licensed. The documentation text is
          available for reference and reuse with attribution.
        </p>
      </LegalSection>

      <LegalSection id="dependencies" heading="Dependencies">
        <p>
          The library ships with no runtime dependencies of its own. When you
          use a framework integration, the framework itself remains under its
          own license.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
