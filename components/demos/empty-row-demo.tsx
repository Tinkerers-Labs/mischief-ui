"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { EmptyRow } from "@/registry/default/empty-row/empty-row"

const columns = ["Fund", "1Y", "Expense"]

export function EmptyRowDemo() {
  return (
    <DemoVariants
      label="Empty row"
      variants={[
        {
          id: "table",
          label: "In a table",
          render: () => (
            <table className="border-border w-full max-w-md border-collapse rounded-[var(--radius)] border text-sm">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="border-border text-muted-foreground border-b px-4 py-2 text-left text-xs font-medium"
                      scope="col"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <EmptyRow colSpan={columns.length}>
                  No funds match these filters.
                </EmptyRow>
              </tbody>
            </table>
          ),
        },
        {
          id: "list",
          label: "In a list",
          render: () => (
            <div className="border-border w-full max-w-md rounded-[var(--radius)] border">
              <EmptyRow />
            </div>
          ),
        },
      ]}
    />
  )
}
