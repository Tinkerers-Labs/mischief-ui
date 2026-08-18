"use client"

import { SchemaBuilder } from "@/registry/default/schema-builder/schema-builder"

export function SchemaBuilderDemo() {
  return (
    <SchemaBuilder
      className="w-full max-w-xl"
      defaultFields={[
        {
          id: "vendor",
          name: "vendor",
          type: "string",
          description: "Who issued the invoice.",
          required: true,
        },
        {
          id: "lines",
          name: "line_items",
          type: "array",
          fields: [
            { id: "desc", name: "description", type: "string" },
            { id: "amount", name: "amount", type: "number", required: true },
          ],
        },
      ]}
    />
  )
}
