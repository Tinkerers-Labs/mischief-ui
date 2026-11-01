"use client"

import * as React from "react"

import { QuantityButton } from "@/registry/default/quantity-button/quantity-button"

const menu = [
  {
    id: "margherita",
    name: "Margherita pizza",
    note: "Tomato, mozzarella, basil",
    price: 11,
  },
  {
    id: "dal",
    name: "Dal makhani",
    note: "Slow cooked black lentils",
    price: 9,
  },
  {
    id: "lemonade",
    name: "Mint lemonade",
    note: "Up to 4 per order",
    price: 3.5,
    max: 4,
  },
]

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function QuantityButtonDemo() {
  const [cart, setCart] = React.useState<Record<string, number>>({
    dal: 2,
  })

  const total = menu.reduce(
    (sum, item) => sum + (cart[item.id] ?? 0) * item.price,
    0
  )
  const items = Object.values(cart).reduce((sum, count) => sum + count, 0)

  return (
    <div className="bg-background border-border w-full max-w-[26rem] rounded-[1.25rem] border p-2 shadow-sm">
      <ul className="divide-border divide-y">
        {menu.map((item) => (
          <li key={item.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {money.format(item.price)} · {item.note}
              </p>
            </div>
            <QuantityButton
              label={item.name}
              max={item.max}
              value={cart[item.id] ?? 0}
              onValueChange={async (count) => {
                // Stands in for the request that updates the basket.
                await new Promise((resolve) => setTimeout(resolve, 350))
                setCart((current) => ({ ...current, [item.id]: count }))
              }}
            />
          </li>
        ))}
      </ul>
      <div className="bg-muted mt-1 flex items-center justify-between rounded-[0.9rem] px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          {items === 1 ? "1 item" : `${items} items`}
        </span>
        <span className="font-semibold tabular-nums">
          {money.format(total)}
        </span>
      </div>
    </div>
  )
}
