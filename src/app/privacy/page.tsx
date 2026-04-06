import { ContentPage } from "@/components/ContentPage";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE_CONTACT.legalName} handles your data during checkout and account use.`,
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      lead="This summary explains what we collect and why. Replace with lawyer-reviewed text before going live if required."
    >
      <h2>What we collect</h2>
      <p>
        When you create an account or place an order, we may store your name,
        email, delivery details, and order history. Payments are processed by
        Paystack; we do not store your full card number.
      </p>
      <h2>How we use it</h2>
      <p>
        We use this information to fulfil orders, communicate about your
        purchase, and keep the site secure. We do not sell your personal data.
      </p>
      <h2>Cookies & analytics</h2>
      <p>
        The site may use essential cookies for sign-in and cart behaviour.
        Optional analytics depend on your deployment — disclose what you
        actually enable.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions, email{" "}
        <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>. See
        also our <Link href="/terms">terms of use</Link>.
      </p>
    </ContentPage>
  );
}
