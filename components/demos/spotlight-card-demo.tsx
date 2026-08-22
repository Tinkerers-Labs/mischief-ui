"use client"

import { SpotlightCard } from "@/registry/default/spotlight-card/spotlight-card"

const plans = [
  { name: "Sketch", price: "Free", note: "One project, all components." },
  { name: "Studio", price: "$12", note: "Unlimited projects and themes." },
  { name: "Workshop", price: "$40", note: "Everything, plus review calls." },
]

export function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {plans.map((plan) => (
        <SpotlightCard key={plan.name} followGroup className="p-5">
          <p className="text-sm font-semibold">{plan.name}</p>
          <p className="mt-2 text-2xl font-semibold">{plan.price}</p>
          <p className="text-muted-foreground mt-2 text-xs">{plan.note}</p>
        </SpotlightCard>
      ))}
    </div>
  )
}
