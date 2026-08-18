import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Questionnaire,
  type Question,
} from "../registry/default/questionnaire/questionnaire"

const questions: Question[] = [
  {
    id: "scope",
    prompt: "What should I change?",
    required: true,
    choices: [
      { id: "one", label: "Only this file" },
      { id: "all", label: "Every file that matches" },
    ],
  },
  {
    id: "extras",
    prompt: "Anything else to include?",
    multiple: true,
    freeform: true,
    choices: [
      { id: "tests", label: "Update the tests" },
      { id: "docs", label: "Update the docs" },
    ],
  },
]

describe("Questionnaire", () => {
  it("asks one question at a time and reports progress", () => {
    render(<Questionnaire questions={questions} />)

    expect(screen.getByText("Question 1 of 2")).toBeVisible()
    expect(screen.getByText("What should I change?")).toBeVisible()
    expect(
      screen.queryByText("Anything else to include?")
    ).not.toBeInTheDocument()
  })

  it("uses radios for one answer and checkboxes for several", async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} />)

    expect(screen.getAllByRole("radio")).toHaveLength(2)

    await user.click(screen.getByRole("radio", { name: /only this file/i }))
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getAllByRole("checkbox")).toHaveLength(2)
  })

  it("keeps only one answer for a single-choice question", async () => {
    const user = userEvent.setup()
    const onAnswersChange = vi.fn()

    render(
      <Questionnaire questions={questions} onAnswersChange={onAnswersChange} />
    )

    await user.click(screen.getByRole("radio", { name: /only this file/i }))
    await user.click(screen.getByRole("radio", { name: /every file/i }))

    expect(onAnswersChange).toHaveBeenLastCalledWith({ scope: ["all"] })
  })

  it("accumulates answers for a multiple-choice question", async () => {
    const user = userEvent.setup()
    const onAnswersChange = vi.fn()

    render(
      <Questionnaire
        questions={questions}
        defaultAnswers={{ scope: ["one"] }}
        onAnswersChange={onAnswersChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(
      screen.getByRole("checkbox", { name: /update the tests/i })
    )
    await user.click(screen.getByRole("checkbox", { name: /update the docs/i }))

    expect(onAnswersChange).toHaveBeenLastCalledWith({
      scope: ["one"],
      extras: ["tests", "docs"],
    })
  })

  it("refuses to advance past a required question", async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} />)

    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      /choose an answer to continue/i
    )
    expect(screen.getByText("Question 1 of 2")).toBeVisible()
  })

  it("offers skip only when the question is optional", async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} />)

    expect(
      screen.queryByRole("button", { name: "Skip" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: /only this file/i }))
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByRole("button", { name: "Skip" })).toBeVisible()
  })

  it("submits the collected answers on the last question", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Questionnaire questions={questions} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("radio", { name: /every file/i }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("checkbox", { name: /update the docs/i }))
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(onSubmit).toHaveBeenCalledWith({ scope: ["all"], extras: ["docs"] })
  })

  it("keeps a freeform answer alongside the chosen options", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Questionnaire
        questions={questions}
        defaultAnswers={{ scope: ["one"] }}
        onSubmit={onSubmit}
      />
    )

    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(
      screen.getByRole("checkbox", { name: /update the tests/i })
    )
    await user.type(
      screen.getByRole("textbox", { name: /another answer/i }),
      "Bump the changelog"
    )
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(onSubmit).toHaveBeenCalledWith({
      scope: ["one"],
      extras: ["tests", "__freeform__Bump the changelog"],
    })
  })

  it("moves back to an earlier question with the answer intact", async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} />)

    await user.click(screen.getByRole("radio", { name: /only this file/i }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Back" }))

    expect(screen.getByRole("radio", { name: /only this file/i })).toBeChecked()
  })

  it("picks a choice from its number shortcut", () => {
    const onAnswersChange = vi.fn()

    const { container } = render(
      <Questionnaire questions={questions} onAnswersChange={onAnswersChange} />
    )

    fireEvent.keyDown(container.querySelector("form")!, { key: "2" })

    expect(onAnswersChange).toHaveBeenCalledWith({ scope: ["all"] })
  })

  it("leaves number keys alone while typing a freeform answer", async () => {
    const user = userEvent.setup()
    const onAnswersChange = vi.fn()

    render(
      <Questionnaire
        questions={questions}
        defaultAnswers={{ scope: ["one"] }}
        onAnswersChange={onAnswersChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.type(
      screen.getByRole("textbox", { name: /another answer/i }),
      "2 files"
    )

    expect(onAnswersChange).toHaveBeenLastCalledWith({
      scope: ["one"],
      extras: ["__freeform__2 files"],
    })
  })
})
