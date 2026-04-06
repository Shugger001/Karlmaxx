import { ContentPage } from "@/components/ContentPage";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_CONTACT.legalName} and how we curate menswear and accessories.`,
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About Karlmaxx"
      lead={`${SITE_CONTACT.legalName} brings together menswear, bags, fragrance, watches, and tech in one storefront — with clear pricing and secure Paystack checkout.`}
    >
      <h2>What we sell</h2>
      <p>
        We focus on pieces that work for everyday wear and gifting: clothing and
        accessories, bags, fragrance, and select watches and tech. Inventory and
        photos are managed through our admin tools so the shop stays accurate.
      </p>
      <h2>How checkout works</h2>
      <p>
        You add items to your cart, review totals on the checkout page, and pay
        with Paystack. We do not store your full card details on our servers.
      </p>
      <h2>Questions</h2>
      <p>
        Visit our <Link href="/faq">FAQ</Link> or{" "}
        <Link href="/contact">contact</Link> page for order help and policies.
      </p>
    </ContentPage>
  );
}
