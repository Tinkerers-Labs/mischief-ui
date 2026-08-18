"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type QuestionChoice = {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
}

export type Question = {
  id: string
  prompt: React.ReactNode
  description?: React.ReactNode
  choices?: QuestionChoice[]
  multiple?: boolean
  freeform?: boolean
  freeformLabel?: string
  freeformPlaceholder?: string
  required?: boolean
}

/** Chosen choice ids per question, with any freeform answer last. */
export type QuestionnaireAnswers = Record<string, string[]>

export type QuestionnaireProps = Omit<
  React.HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "children"
> & {
  questions: Question[]
  answers?: QuestionnaireAnswers
  defaultAnswers?: QuestionnaireAnswers
  onAnswersChange?: (answers: QuestionnaireAnswers) => void
  onSubmit?: (answers: QuestionnaireAnswers) => void
  shortcuts?: boolean
  showProgress?: boolean
  previousLabel?: string
  nextLabel?: string
  skipLabel?: string
  submitLabel?: string
  requiredMessage?: string
}

const FREEFORM = "__freeform__"

function answered(answers: QuestionnaireAnswers, question: Question) {
  return (answers[question.id] ?? []).some((value) => value.trim().length > 0)
}

export function Questionnaire({
  questions,
  answers,
  defaultAnswers = {},
  onAnswersChange,
  onSubmit,
  shortcuts = true,
  showProgress = true,
  previousLabel = "Back",
  nextLabel = "Next",
  skipLabel = "Skip",
  submitLabel = "Submit",
  requiredMessage = "Choose an answer to continue.",
  className,
  ...formProps
}: QuestionnaireProps) {
  const reactId = React.useId()
  const [index, setIndex] = React.useState(0)
  const [uncontrolled, setUncontrolled] =
    React.useState<QuestionnaireAnswers>(defaultAnswers)
  const [showError, setShowError] = React.useState(false)

  const value = answers ?? uncontrolled
  const question = questions[Math.min(index, questions.length - 1)]

  if (!question) return null

  const isLast = index === questions.length - 1
  const complete = answered(value, question)
  const blocked = Boolean(question.required) && !complete

  const commit = (next: QuestionnaireAnswers) => {
    if (answers === undefined) setUncontrolled(next)
    onAnswersChange?.(next)
  }

  const setChoice = (choiceId: string, checked: boolean) => {
    const current = value[question.id] ?? []
    const freeform = current.filter((entry) => entry.startsWith(FREEFORM))
    const chosen = current.filter((entry) => !entry.startsWith(FREEFORM))

    const nextChosen = question.multiple
      ? checked
        ? [...chosen, choiceId]
        : chosen.filter((entry) => entry !== choiceId)
      : [choiceId]

    setShowError(false)
    commit({ ...value, [question.id]: [...nextChosen, ...freeform] })
  }

  const setFreeform = (text: string) => {
    const current = value[question.id] ?? []
    const chosen = current.filter((entry) => !entry.startsWith(FREEFORM))
    const next = text.trim() ? [...chosen, `${FREEFORM}${text}`] : chosen

    setShowError(false)
    commit({ ...value, [question.id]: next })
  }

  const advance = () => {
    if (blocked) {
      setShowError(true)
      return
    }

    setShowError(false)
    if (isLast) onSubmit?.(value)
    else setIndex((current) => current + 1)
  }

  const freeformValue =
    (value[question.id] ?? [])
      .find((entry) => entry.startsWith(FREEFORM))
      ?.slice(FREEFORM.length) ?? ""

  const chosen = new Set(
    (value[question.id] ?? []).filter((entry) => !entry.startsWith(FREEFORM))
  )

  const errorId = `${reactId}-error`

  // The hints on each choice have to do something, so number keys pick the
  // choice they label, unless the caller is typing into the freeform field.
  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (!shortcuts) return
    if (event.metaKey || event.ctrlKey || event.altKey) return

    // A text field has no type attribute unless one is set, so treat anything
    // that is not a radio or checkbox as somewhere the caller is typing.
    const target = event.target as HTMLInputElement
    const typing =
      target.tagName === "TEXTAREA" ||
      (target.tagName === "INPUT" &&
        target.type !== "radio" &&
        target.type !== "checkbox")

    if (typing) return

    const position = Number(event.key)
    if (!Number.isInteger(position) || position < 1) return

    const choice = question.choices?.[position - 1]
    if (!choice) return

    event.preventDefault()
    setChoice(choice.id, !chosen.has(choice.id))
  }

  return (
    <form
      data-slot="questionnaire"
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      onKeyDown={onKeyDown}
      onSubmit={(event) => {
        event.preventDefault()
        advance()
      }}
      {...formProps}
    >
      {showProgress ? (
        <div
          data-slot="questionnaire-progress"
          className="border-border flex items-center gap-3 border-b px-4 py-2.5"
        >
          <p aria-live="polite" className="text-muted-foreground text-xs">
            Question {index + 1} of {questions.length}
          </p>

          <span
            aria-hidden="true"
            className="bg-muted ml-auto h-1 w-24 overflow-hidden rounded-full"
          >
            <span
              className="bg-foreground block h-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </span>
        </div>
      ) : null}

      <fieldset className="border-0 px-4 py-4">
        <legend
          data-slot="questionnaire-prompt"
          className="text-sm font-semibold text-pretty"
        >
          {question.prompt}
        </legend>

        {question.description ? (
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {question.description}
          </p>
        ) : null}

        <div className="mt-3 grid gap-1.5">
          {(question.choices ?? []).map((choice, choiceIndex) => {
            const id = `${reactId}-${question.id}-${choice.id}`
            const isChosen = chosen.has(choice.id)

            return (
              <label
                key={choice.id}
                data-slot="questionnaire-choice"
                data-chosen={isChosen || undefined}
                htmlFor={id}
                className={cn(
                  "border-border flex cursor-pointer items-start gap-2.5 rounded-[calc(var(--radius)-0.25rem)] border px-3 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none",
                  isChosen
                    ? "border-foreground bg-muted/60"
                    : "hover:bg-muted/40"
                )}
              >
                <input
                  id={id}
                  className="mt-0.5"
                  name={`${reactId}-${question.id}`}
                  type={question.multiple ? "checkbox" : "radio"}
                  checked={isChosen}
                  aria-describedby={showError ? errorId : undefined}
                  onChange={(event) =>
                    setChoice(choice.id, event.target.checked)
                  }
                />

                <span className="min-w-0 flex-1">
                  <span className="font-medium">{choice.label}</span>
                  {choice.description ? (
                    <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                      {choice.description}
                    </span>
                  ) : null}
                </span>

                {shortcuts && choiceIndex < 9 ? (
                  <kbd
                    aria-hidden="true"
                    className="border-border text-muted-foreground rounded border px-1 font-[family-name:var(--font-mono),monospace] text-[0.65rem]"
                  >
                    {choiceIndex + 1}
                  </kbd>
                ) : null}
              </label>
            )
          })}
        </div>

        {question.freeform ? (
          <div className="mt-2">
            <label
              className="sr-only"
              htmlFor={`${reactId}-${question.id}-freeform`}
            >
              {question.freeformLabel ?? "Another answer"}
            </label>
            <input
              id={`${reactId}-${question.id}-freeform`}
              className="border-border placeholder:text-muted-foreground focus-visible:ring-ring min-h-11 w-full rounded-[calc(var(--radius)-0.25rem)] border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
              placeholder={question.freeformPlaceholder ?? "Something else…"}
              value={freeformValue}
              onChange={(event) => setFreeform(event.target.value)}
            />
          </div>
        ) : null}

        {showError ? (
          <p
            id={errorId}
            role="alert"
            className="text-destructive mt-2 flex items-center gap-1.5 text-xs"
          >
            <TriangleAlert aria-hidden="true" size={13} />
            {requiredMessage}
          </p>
        ) : null}
      </fieldset>

      <div
        data-slot="questionnaire-actions"
        className="border-border flex items-center gap-2 border-t px-3 py-2.5"
      >
        <button
          type="button"
          disabled={index === 0}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
          onClick={() => {
            setShowError(false)
            setIndex((current) => Math.max(current - 1, 0))
          }}
        >
          <ArrowLeft aria-hidden="true" size={13} />
          {previousLabel}
        </button>

        {!question.required ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto inline-flex min-h-9 items-center rounded-full px-2.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            onClick={() => {
              setShowError(false)
              if (isLast) onSubmit?.(value)
              else setIndex((current) => current + 1)
            }}
          >
            {skipLabel}
          </button>
        ) : null}

        <button
          type="submit"
          data-slot="questionnaire-next"
          className={cn(
            "bg-foreground text-background focus-visible:ring-ring inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
            question.required ? "ml-auto" : ""
          )}
        >
          {isLast ? submitLabel : nextLabel}
          {isLast ? (
            <Check aria-hidden="true" size={13} />
          ) : (
            <ArrowRight aria-hidden="true" size={13} />
          )}
        </button>
      </div>
    </form>
  )
}
