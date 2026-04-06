import { ContentPage } from "@/components/ContentPage";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Terms and conditions for using the ${SITE_CONTACT.legalName} storefront.`,
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of use"
      lead="These terms govern use of this website and placing orders. Replace with counsel-reviewed wording before launch if you need binding legal text."
    >
      <h2>Using the site</h2>
      <p>
        By browsing or purchasing, you agree to follow these terms and any
        policies linked here (including{" "}
        <Link href="/privacy">Privacy</Link> and{" "}
        <Link href="/shipping">Shipping &amp; returns</Link>).
      </p>
      <h2>Products &amp; pricing</h2>
      <p>
        Descriptions, images, and prices aim to be accurate; mistakes may occur.
        We may correct errors, update availability, or refuse or cancel orders
        that we cannot fulfil.
      </p>
      <h2>Payment</h2>
      <p>
        Payment is processed by Paystack. You authorise us and Paystack to charge
        your chosen payment method for the order total shown at checkout.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, we are not liable for indirect or
        consequential losses arising from use of the site or delayed delivery
        outside our reasonable control.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>.
      </p>
    </ContentPage>
  );
}
