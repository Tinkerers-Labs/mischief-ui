"use client"

import * as React from "react"

import {
  Questionnaire,
  type Question,
  type QuestionnaireAnswers,
} from "@/registry/default/questionnaire/questionnaire"

const questions: Question[] = [
  {
    id: "scope",
    prompt: "Which files should I rename?",
    description: "I found 41 matches across the repository.",
    required: true,
    choices: [
      { id: "open", label: "Only the file I have open" },
      { id: "src", label: "Everything under src", description: "38 files" },
      { id: "all", label: "Every match", description: "41 files" },
    ],
  },
  {
    id: "extras",
    prompt: "Anything to do alongside it?",
    multiple: true,
    freeform: true,
    freeformPlaceholder: "Something else…",
    choices: [
      { id: "tests", label: "Update the tests" },
      { id: "imports", label: "Fix the imports" },
      { id: "changelog", label: "Add a changelog entry" },
    ],
  },
  {
    id: "review",
    prompt: "How should I hand it back?",
    required: true,
    choices: [
      { id: "diff", label: "Show me the diff first" },
      { id: "commit", label: "Commit it on a branch" },
    ],
  },
]

export function QuestionnaireDemo() {
  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>()

  if (answers) {
    return (
      <div className="grid w-full max-w-md gap-3 text-sm">
        <p className="font-semibold">Thanks, that is enough to start.</p>
        <ul className="text-muted-foreground grid gap-1">
          {questions.map((question) => (
            <li key={question.id}>
              {question.id}:{" "}
              {(answers[question.id] ?? [])
                .map((value) => value.replace("__freeform__", ""))
                .join(", ") || "skipped"}
            </li>
          ))}
        </ul>
        <button
          className="restore-button justify-self-start"
          type="button"
          onClick={() => setAnswers(undefined)}
        >
          Ask again
        </button>
      </div>
    )
  }

  return (
    <Questionnaire
      className="w-full max-w-md"
      questions={questions}
      onSubmit={setAnswers}
    />
  )
}
