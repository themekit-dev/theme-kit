import {
  LegalShell,
  LegalSection,
  LegalList,
  legalMetadata,
} from "../../components/legal/legal-page";
import { SITE_URL, GITHUB_URL, CONTACT_URL, CONTACT_EMAIL } from "../../lib/site";

export const metadata = legalMetadata(
  "Privacy Policy",
  "What the Theme Kit documentation website stores and why: theme preference cookies and browser storage, nothing else.",
);

const updated = "August 24, 2026";

export default function PrivacyPage() {
  return (
    <LegalShell
      heading="Privacy Policy"
      updated={updated}
      lead={
        <>
          This policy describes what the Theme Kit documentation website
          ({" "}
          <a href={SITE_URL} className="underline">
            {SITE_URL.replace(/^https?:\/\//, "")}
          </a>
          ) stores and why. It covers the site — not the Theme Kit library
          itself, which runs entirely inside your own application and stores
          whatever your app tells it to store.
        </>
      }
    >
      <LegalSection id="scope" heading="What this site is">
        <p>
          The site is an interactive documentation website: documentation
          pages, a playground, and client-side search. It has no accounts, no
          login, no comment system, and no forms that submit data to a server.
        </p>
      </LegalSection>

      <LegalSection id="cookies" heading="Cookies">
        <p>
          The site sets four first-party cookies to remember your theme
          preference so the server can render the correct theme on your next
          visit. They are set only when you change your theme preference, and
          they are not used for advertising, analytics, or cross-site
          tracking.
        </p>
        <LegalList
          items={[
            <>
              <code className="font-mono text-[0.9em]">theme-name</code> — the
              resolved theme name you selected.
            </>,
            <>
              <code className="font-mono text-[0.9em]">theme-family</code> —
              the theme family you selected (for example{" "}
              <code className="font-mono text-[0.9em]">mint</code>).
            </>,
            <>
              <code className="font-mono text-[0.9em]">theme-mode</code> —
              light, dark, or system.
            </>,
            <>
              <code className="font-mono text-[0.9em]">
                theme-fingerprint
              </code>{" "}
              — a short identifier of the site&apos;s current theme set, used
              to ignore stale cookies after the site updates its themes.
            </>,
          ]}
        />
        <p className="mt-3">
          All four are set with <code className="font-mono text-[0.9em]">
            SameSite=Lax
          </code>
          , <code className="font-mono text-[0.9em]">path=/</code>, and a
          one-year lifetime. You can remove them at any time by clearing
          cookies and site data for this site in your browser.
        </p>
      </LegalSection>

      <LegalSection id="storage" heading="Browser storage">
        <LegalList
          items={[
            <>
              <strong>localStorage</strong> — one key,{" "}
              <code className="font-mono text-[0.9em]">theme-selection</code>
              , holding your theme preference (mode and family). It is written
              when you change the theme and read on load. It stays only in
              your browser and is cleared with your browser&apos;s site data.
            </>,
            <>
              <strong>sessionStorage</strong> — a few keys (such as the docs
              sidebar scroll position) that preserve UI state while you
              navigate the site. They are cleared when you close the tab.
            </>,
            <>
              <strong>In-memory timezone</strong> — the site&apos;s
              sunrise/sunset scheduling reads your browser&apos;s local
              timezone to compute when to switch themes. This is used only in
              your browser and is never transmitted.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="search" heading="Search">
        <p>
          Site search runs entirely in your browser over a search index that
          ships with the site. Search queries never leave your browser and are
          not logged.
        </p>
      </LegalSection>

      <LegalSection id="playground" heading="Playground">
        <p>
          The playground (theme switching, presets, token editing) runs
          entirely in your browser. Nothing you do there is transmitted to us.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" heading="Third parties">
        <LegalList
          items={[
            <>
              <strong>Hosting</strong> — the site is served by Vercel. Like
              any hosting provider, Vercel records standard server logs
              (request time, IP address, user agent) in line with its own
              privacy policy. We do not add analytics scripts to the site.
            </>,
            <>
              <strong>Fonts</strong> — the site&apos;s fonts are downloaded at
              build time and self-hosted. No font files are requested from
              Google or any other domain when you visit.
            </>,
            <>
              <strong>Outbound links</strong> — the site links to GitHub, npm,
              and X/Twitter. Once you leave the site, those services&apos;
              own policies apply.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="no-collection" heading="What we do not collect">
        <p>
          We do not collect your name, email address, or account information.
          We do not run analytics, advertising, or third-party trackers. We do
          not store your themes, configurations, or any files you create in
          the playground on our servers. Theme Kit is a library — your
          applications remain yours.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="Changes">
        <p>
          If the site changes in a way that affects this policy (for example,
          adding analytics or a contact form), this page will be updated with
          a new effective date.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="Contact">
        <p>
          Questions about this policy can be directed to the project
          maintainers at{" "}
          <a href={CONTACT_URL} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          or through the{" "}
          <a href={GITHUB_URL} className="underline">
            GitHub repository
          </a>
          .
        </p>
        <p className="mt-2 text-sm opacity-60">
          This policy describes the site&apos;s actual behavior as of the date
          above. Please have final legal text reviewed by a qualified
          professional for your jurisdiction.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
