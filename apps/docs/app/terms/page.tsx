import {
  LegalShell,
  LegalSection,
  LegalList,
  legalMetadata,
} from "../../components/legal/legal-page";
import { SITE_URL, GITHUB_URL, CONTACT_URL, CONTACT_EMAIL } from "../../lib/site";

export const metadata = legalMetadata(
  "Terms of Use",
  "The terms that apply to using the Theme Kit documentation website.",
);

const updated = "August 24, 2026";

export default function TermsPage() {
  return (
    <LegalShell
      heading="Terms of Use"
      updated={updated}
      lead={
        <>
          These terms apply to using the Theme Kit documentation website (
          <a href={SITE_URL} className="underline">
            {SITE_URL.replace(/^https?:\/\//, "")}
          </a>
          ). They are about the website, not about the Theme Kit library —
          the library is MIT-licensed open source software, and your use of it
          in your own applications is governed by its{" "}
          <a href="/license" className="underline">license</a>, not by these
          terms.
        </>
      }
    >
      <LegalSection id="site" heading="The site">
        <p>
          The site provides documentation, a playground, and search for the
          Theme Kit library. The playground runs entirely in your browser; the
          site does not operate accounts, host user content, or provide any
          hosted service.
        </p>
      </LegalSection>

      <LegalSection id="license" heading="Intellectual property">
        <LegalList
          items={[
            <>
              The Theme Kit library and the code examples shown on this site
              are distributed under the{" "}
              <a href="/license" className="underline">MIT License</a>.
            </>,
            <>
              The documentation text and site design are provided for your use
              in building with Theme Kit. Please do not republish large
              portions of the documentation as your own without attribution.
            </>,
            <>
              The &ldquo;Theme Kit&rdquo; name and logo may be used to
              reference the project, but not in a way that suggests official
              endorsement of unrelated products.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="acceptable-use" heading="Acceptable use">
        <p>When using the site, please do not:</p>
        <LegalList
          items={[
            <>attempt to disrupt, overload, or gain unauthorized access to the site or its hosting infrastructure</>,
            <>scrape the documentation at a scale that degrades the site for others</>,
            <>misrepresent your affiliation with the Theme Kit project</>,
            <>use the site in violation of applicable law</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="no-warranty" heading="No warranty">
        <p>
          The site and the library are provided &ldquo;as is&rdquo; without
          warranty of any kind, express or implied. To the maximum extent
          permitted by law, the maintainers are not liable for any damages
          arising from your use of the site or the library.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="Changes">
        <p>
          We may update these terms as the site evolves. Material changes will
          be reflected by a new effective date on this page.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="Contact">
        <p>
          Questions about these terms can be directed to the maintainers at{" "}
          <a href={CONTACT_URL} className="underline">
            {CONTACT_EMAIL}
          </a>{" "}
          or through the{" "}
          <a href={GITHUB_URL} className="underline">
            GitHub repository
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
