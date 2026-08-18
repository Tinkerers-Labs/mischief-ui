"use client"

import * as React from "react"
import { ChevronRight, Plus, Trash2 } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SchemaFieldType =
  "string" | "number" | "boolean" | "date" | "object" | "array"

export type SchemaField = {
  id: string
  name: string
  type: SchemaFieldType
  description?: string
  required?: boolean
  fields?: SchemaField[]
}

export type SchemaBuilderProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> & {
  fields?: SchemaField[]
  defaultFields?: SchemaField[]
  onFieldsChange?: (fields: SchemaField[]) => void
  types?: readonly SchemaFieldType[]
  maxDepth?: number
  label?: string
  addLabel?: string
  createId?: () => string
}

const DEFAULT_TYPES = [
  "string",
  "number",
  "boolean",
  "date",
  "object",
  "array",
] as const

function nests(type: SchemaFieldType) {
  return type === "object" || type === "array"
}

function updateAt(
  fields: SchemaField[],
  id: string,
  update: (field: SchemaField) => SchemaField | null
): SchemaField[] {
  return fields.flatMap((field) => {
    if (field.id === id) {
      const next = update(field)
      return next ? [next] : []
    }

    if (!field.fields) return [field]

    return [{ ...field, fields: updateAt(field.fields, id, update) }]
  })
}

function FieldRow({
  field,
  depth,
  maxDepth,
  types,
  addLabel,
  onChange,
  onRemove,
  onAddChild,
}: {
  field: SchemaField
  depth: number
  maxDepth: number
  types: readonly SchemaFieldType[]
  addLabel: string
  onChange: (id: string, patch: Partial<SchemaField>) => void
  onRemove: (id: string) => void
  onAddChild: (parentId: string) => void
}) {
  const reactId = React.useId()
  const canNest = nests(field.type) && depth < maxDepth
  const [open, setOpen] = React.useState(true)

  return (
    <li data-slot="schema-field" data-type={field.type}>
      <div className="border-border bg-background grid gap-2 rounded-[calc(var(--radius)-0.25rem)] border p-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="grid gap-1.5">
          <label className="sr-only" htmlFor={`${reactId}-name`}>
            Field name
          </label>
          <input
            id={`${reactId}-name`}
            className="placeholder:text-muted-foreground min-h-9 bg-transparent font-[family-name:var(--font-mono),monospace] text-sm font-semibold outline-none"
            placeholder="field_name"
            value={field.name}
            onChange={(event) =>
              onChange(field.id, { name: event.target.value })
            }
          />

          <label className="sr-only" htmlFor={`${reactId}-description`}>
            Description for {field.name || "this field"}
          </label>
          <input
            id={`${reactId}-description`}
            className="placeholder:text-muted-foreground text-muted-foreground min-h-8 bg-transparent text-xs outline-none"
            placeholder="What should the model extract here?"
            value={field.description ?? ""}
            onChange={(event) =>
              onChange(field.id, { description: event.target.value })
            }
          />
        </div>

        <div className="flex items-start gap-2">
          <label className="sr-only" htmlFor={`${reactId}-type`}>
            Type for {field.name || "this field"}
          </label>
          <select
            id={`${reactId}-type`}
            className="border-border bg-background min-h-9 rounded-full border px-2.5 text-xs font-semibold"
            value={field.type}
            onChange={(event) =>
              onChange(field.id, {
                type: event.target.value as SchemaFieldType,
              })
            }
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label className="text-muted-foreground inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold">
            <input
              checked={field.required ?? false}
              type="checkbox"
              onChange={(event) =>
                onChange(field.id, { required: event.target.checked })
              }
            />
            Required
          </label>
        </div>

        <div className="flex items-start gap-1">
          {canNest ? (
            <button
              type="button"
              aria-expanded={open}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">
                {open ? "Hide" : "Show"} fields inside{" "}
                {field.name || "this field"}
              </span>
              <ChevronRight
                aria-hidden="true"
                size={14}
                className={cn(
                  "transition-transform duration-150 motion-reduce:transition-none",
                  open && "rotate-90"
                )}
              />
            </button>
          ) : null}

          <button
            type="button"
            className="text-muted-foreground hover:text-destructive focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => onRemove(field.id)}
          >
            <span className="sr-only">Remove {field.name || "this field"}</span>
            <Trash2 aria-hidden="true" size={14} />
          </button>
        </div>
      </div>

      {canNest && open ? (
        <div className="border-border mt-2 ml-3 border-l pl-3">
          <ul className="grid gap-2">
            {(field.fields ?? []).map((child) => (
              <FieldRow
                key={child.id}
                addLabel={addLabel}
                depth={depth + 1}
                field={child}
                maxDepth={maxDepth}
                types={types}
                onAddChild={onAddChild}
                onChange={onChange}
                onRemove={onRemove}
              />
            ))}
          </ul>

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => onAddChild(field.id)}
          >
            <Plus aria-hidden="true" size={13} />
            {addLabel} inside {field.name || "this field"}
          </button>
        </div>
      ) : null}
    </li>
  )
}

export function SchemaBuilder({
  fields,
  defaultFields = [],
  onFieldsChange,
  types = DEFAULT_TYPES,
  maxDepth = 3,
  label = "Extraction schema",
  addLabel = "Add field",
  createId,
  className,
  ...rootProps
}: SchemaBuilderProps) {
  const [uncontrolled, setUncontrolled] =
    React.useState<SchemaField[]>(defaultFields)
  const value = fields ?? uncontrolled
  const counter = React.useRef(0)

  const nextId = () => {
    if (createId) return createId()
    counter.current += 1
    return `field-${counter.current}-${value.length}`
  }

  const commit = (next: SchemaField[]) => {
    if (fields === undefined) setUncontrolled(next)
    onFieldsChange?.(next)
  }

  const change = (id: string, patch: Partial<SchemaField>) => {
    commit(updateAt(value, id, (field) => ({ ...field, ...patch })))
  }

  const remove = (id: string) => {
    commit(updateAt(value, id, () => null))
  }

  const addChild = (parentId: string) => {
    commit(
      updateAt(value, parentId, (field) => ({
        ...field,
        fields: [
          ...(field.fields ?? []),
          { id: nextId(), name: "", type: "string" as const },
        ],
      }))
    )
  }

  return (
    <section
      data-slot="schema-builder"
      aria-label={label}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border p-3",
        className
      )}
      {...rootProps}
    >
      <ul className="grid gap-2">
        {value.map((field) => (
          <FieldRow
            key={field.id}
            addLabel={addLabel}
            depth={1}
            field={field}
            maxDepth={maxDepth}
            types={types}
            onAddChild={addChild}
            onChange={change}
            onRemove={remove}
          />
        ))}
      </ul>

      <button
        type="button"
        data-slot="schema-builder-add"
        className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 focus-visible:ring-ring mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[calc(var(--radius)-0.25rem)] border border-dashed text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
        onClick={() =>
          commit([...value, { id: nextId(), name: "", type: "string" }])
        }
      >
        <Plus aria-hidden="true" size={15} />
        {addLabel}
      </button>
    </section>
  )
}
