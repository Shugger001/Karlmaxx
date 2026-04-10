import { ContentPage } from "@/components/ContentPage";
import { SITE_CONTACT } from "@/lib/siteContact";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: `How to return or exchange items purchased from ${SITE_CONTACT.legalName}.`,
};

export default function ReturnsPage() {
  return (
    <ContentPage
      title="Returns & refunds"
      lead="Use this page to set clear expectations for customers and cut down on repeat support questions. Update the timelines below to match how you actually operate."
    >
      <h2>Eligibility</h2>
      <p>
        We accept returns on most unused items in original condition, with tags
        and packaging where they apply. Some items (e.g. opened personal-care
        goods or final-sale products) may not be eligible — we will state that on
        the product or at checkout when it applies.
      </p>
      <h2>How to start a return</h2>
      <ol>
        <li>
          Email{" "}
          <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a> within{" "}
          <strong>7 days</strong> of delivery with your order number and the
          reason for the return.
        </li>
        <li>
          We will confirm next steps (return address, refund or exchange, and any
          restocking or shipping fees if applicable).
        </li>
        <li>
          Pack the item securely and send it using a trackable service when we
          ask you to ship it back.
        </li>
      </ol>
      <h2>Refunds</h2>
      <p>
        After we receive and inspect your return, approved refunds are processed
        to your original payment method. Timing depends on your bank or card
        issuer — typically a few business days after we issue the refund.
      </p>
      <h2>Exchanges</h2>
      <p>
        If you need a different size or colour, contact us as soon as possible.
        Exchanges are subject to stock availability and the same condition
        requirements as returns.
      </p>
      <h2>Damaged or wrong items</h2>
      <p>
        If something arrives damaged or is not what you ordered, email us with
        photos and your order number — we will prioritise a replacement or
        refund.
      </p>
      <h2>Shipping costs</h2>
      <p>
        Unless the mistake was ours or the item is faulty, return shipping may be
        your responsibility. See also{" "}
        <Link href="/shipping">Shipping &amp; delivery</Link> for general
        delivery information.
      </p>
      <h2>Need help?</h2>
      <p>
        <Link href="/contact">Contact us</Link> or email{" "}
        <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>.
      </p>
    </ContentPage>
  );
}
