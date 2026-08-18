"use client"

import { SignatureFooter } from "@/registry/default/signature-footer/signature-footer"

export function SignatureFooterDemo() {
  return (
    <SignatureFooter
      className="w-full rounded-[var(--radius)] [&_[data-slot=signature-footer-heading]]:text-[clamp(2.5rem,5vw,4.5rem)] [&_[data-slot=signature-footer-inner]]:px-6 [&_[data-slot=signature-footer-inner]]:pt-8 [&_[data-slot=signature-footer-meta]]:mt-8 [&_[data-slot=signature-footer-navigation]]:hidden [&_[data-slot=signature-footer-wordmark]]:pt-4 [&_[data-slot=signature-footer-wordmark]]:text-[clamp(4rem,10vw,8rem)]"
      eyebrow="One last useful thought"
      heading="Make the ending memorable."
      description="Keep the links practical. Let the wordmark do the rest."
      brand={<strong>Northstar</strong>}
      meta={<span className="text-background/55">Made with care.</span>}
      wordmark="Northstar"
    />
  )
}
