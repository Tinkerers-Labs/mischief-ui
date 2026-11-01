"use client"

import { Sparkline } from "@/registry/default/sparkline/sparkline"

const week = [
  "Oct 20",
  "Oct 21",
  "Oct 22",
  "Oct 23",
  "Oct 24",
  "Oct 25",
  "Oct 26",
  "Oct 27",
  "Oct 28",
  "Oct 29",
  "Oct 30",
  "Oct 31",
  "Nov 1",
  "Nov 2",
]

const routes = [
  {
    path: "GET /search",
    p95: [182, 176, 190, 201, 188, 170, 164, 171, 168, 159, 162, 150, 148, 141],
  },
  {
    path: "POST /checkout",
    p95: [
      312,
      305,
      298,
      320,
      344,
      351,
      362,
      null,
      371,
      380,
      366,
      390,
      402,
      398,
    ],
  },
  {
    path: "GET /orders/:id",
    p95: [88, 90, 87, 91, 89, 88, 90, 92, 89, 88, 90, 91, 89, 90],
  },
]

export function SparklineDemo() {
  return (
    <div className="grid w-full max-w-[34rem] gap-4">
      <div className="bg-card text-card-foreground border-border rounded-xl border p-4">
        <p className="text-muted-foreground text-sm">Active users</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <p className="text-2xl font-semibold">2,418</p>
          <Sparkline
            area
            className="w-40"
            data={[
              1980, 2010, 2104, 2050, 1890, 1760, 2120, 2205, 2240, 2190, 2010,
              1930, 2330, 2418,
            ]}
            height={36}
            label="Daily active users, last 14 days"
            labels={week}
          />
        </div>
      </div>

      <div className="border-border min-w-0 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[22rem] text-sm">
          <caption className="text-muted-foreground px-4 pt-3 text-left text-xs">
            p95 latency in milliseconds, last 14 days. Lower is better.
          </caption>
          <thead>
            <tr className="text-muted-foreground border-border border-b text-left text-xs">
              <th className="px-4 py-2 font-medium" scope="col">
                Route
              </th>
              <th className="px-4 py-2 font-medium" scope="col">
                Today
              </th>
              <th className="px-4 py-2 font-medium" scope="col">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr
                className="border-border border-b last:border-0"
                key={route.path}
              >
                <th
                  className="px-4 py-3 text-left font-mono text-xs font-normal"
                  scope="row"
                >
                  {route.path}
                </th>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {route.p95[route.p95.length - 1]} ms
                </td>
                <td className="px-4 py-2">
                  <Sparkline
                    className="w-32 sm:w-40"
                    data={route.p95}
                    format={{ style: "unit", unit: "millisecond" }}
                    goodDirection="down"
                    label={`${route.path} p95 latency`}
                    labels={week}
                    table
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
