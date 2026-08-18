"use client"

import {
  Citation,
  InlineCitations,
} from "@/registry/default/inline-citations/inline-citations"

const sources = [
  {
    id: "postgres",
    title: "PostgreSQL — Unique indexes",
    url: "https://www.postgresql.org/docs/current/indexes-unique.html",
    snippet: "Null values are not considered equal by a unique constraint.",
  },
  {
    id: "migration",
    title: "0004_add_email_index.sql",
    snippet: "Creates the index before the backfill statement runs.",
  },
]

export function InlineCitationsDemo() {
  return (
    <InlineCitations
      className="w-full max-w-xl text-[0.95rem]"
      sources={sources}
    >
      <p className="leading-relaxed">
        Postgres treats nulls as distinct inside a unique index
        <Citation id="postgres" />, so the constraint itself will not reject the
        empty rows. The failure comes from the ordering in the migration
        <Citation id="migration" />, where the index is created before anything
        backfills the column.
      </p>
    </InlineCitations>
  )
}
