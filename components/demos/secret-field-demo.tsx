"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { SecretField } from "@/registry/default/secret-field/secret-field"

const key = "sk_live_7f3a91c2b8e04d5aa1c6e2"

export function SecretFieldDemo() {
  return (
    <DemoVariants
      label="Secret"
      variants={[
        {
          id: "key",
          label: "API key",
          render: () => (
            <div className="w-full max-w-md">
              <SecretField label="API key" value={key} visiblePrefix={8} />
            </div>
          ),
        },
        {
          id: "sealed",
          label: "Never shown",
          render: () => (
            <div className="w-full max-w-md">
              <SecretField
                label="Signing secret"
                revealable={false}
                value={key}
              />
            </div>
          ),
        },
      ]}
    />
  )
}
