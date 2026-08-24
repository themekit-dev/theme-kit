import {
  LegalShell,
  LegalSection,
  LegalList,
  legalMetadata,
} from "../../components/legal/legal-page";
import { GITHUB_SECURITY } from "../../lib/site";

export const metadata = legalMetadata(
  "Security",
  "How to report a security vulnerability in Theme Kit.",
);

const updated = "August 24, 2026";

export default function SecurityPage() {
  return (
    <LegalShell
      heading="Security"
      updated={updated}
      lead={
        <>
          If you discover a security vulnerability in Theme Kit, please report
          it through the GitHub Security Advisories system so we can address
          it before it is publicly disclosed.
        </>
      }
    >
      <LegalSection id="reporting" heading="Reporting a vulnerability">
        <LegalList
          items={[
            <>
              <strong>Primary channel:</strong>{" "}
              <a href={GITHUB_SECURITY} className="underline">
                github.com/thememk/theme-kit/security/advisories
              </a>{" "}
              — this creates a private advisory visible only to the
              maintainers.
            </>,
            <>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:thememkproductions@gmail.com"
                className="underline"
              >
                themekitproductions@gmail.com
              </a>{" "}
              — for reports that can&apos;t use the advisory system, you can
              email the maintainers directly. Please use a descriptive subject
              line and include as much detail as possible.
            </>,
            <>
              <strong>Do not</strong> file a public GitHub issue for a
              security vulnerability. Use the private advisory system or email
              instead.
            </>,
            <>
              <strong>For non-critical questions</strong>, you can open a
              regular discussion or issue — but if you are unsure, the
              advisory system or email is safer.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="scope" heading="What is in scope">
        <LegalList
          items={[
            <>
              The <code className="font-mono text-[0.9em]">@theme-kit/*</code>{" "}
              packages — core, framework integrations, adapters, and CLI.
            </>,
            <>
              The blocking bootstrap script and the pre-paint CSS — these run
              inline in your application and must not introduce injection
              vectors.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="out-of-scope" heading="What is out of scope">
        <LegalList
          items={[
            <>
              Vulnerabilities in the frameworks Theme Kit integrates with
              (Next.js, Nuxt, Astro, etc.) — report those to the respective
              projects.
            </>,
            <>
              Transitive dependency advisories in framework peer dependencies
              (for example, a postcss vulnerability in Next.js). Theme Kit
              ships zero runtime dependencies of its own; the advisory tree
              of your application is determined by the frameworks you choose.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="process" heading="Our process">
        <p>
          When we receive a report through the advisory system, we will:
        </p>
        <LegalList
          items={[
            <>
              acknowledge receipt within a few business days.
            </>,
            <>
              triage and determine severity and affected versions.
            </>,
            <>
              prepare a fix and release it through the normal release process.
              Critical issues may warrant an immediate patch release.
            </>,
            <>
              publish the advisory after the fix is released, with credit to
              the reporter if they wish.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="thanks" heading="Thanks">
        <p>
          We appreciate responsible disclosure and will acknowledge reporters
          who prefer to be credited in the advisory and release notes.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
