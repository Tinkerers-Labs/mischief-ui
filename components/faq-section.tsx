import { Plus } from "lucide-react"
import Link from "next/link"

import { ExternalLink } from "@/components/external-link"
import { siteConfig } from "@/site.config"

const questions = [
  {
    question: `Is ${siteConfig.name} free to use?`,
    answer: (
      <p>
        Yes. {siteConfig.name} is {siteConfig.license.name} licensed. You can
        use it in personal and commercial projects. The only condition is that
        you keep the copyright and permission notice in copies or substantial
        parts of the software.{" "}
        <Link href={siteConfig.license.route}>Read the license.</Link>
      </p>
    ),
  },
  {
    question: "Should I use the shadcn registry or npm?",
    answer: (
      <p>
        Use the shadcn registry when you want the source in your project and
        plan to change it. Use npm when you prefer package imports and versioned
        updates. Every component page shows both options.
      </p>
    ),
  },
  {
    question: "Will the components match my shadcn theme?",
    answer: (
      <p>
        Yes. Registry components use semantic shadcn tokens such as background,
        foreground, border, muted, and ring. Installing one does not add a
        global {siteConfig.name} theme.
      </p>
    ),
  },
  {
    question: "What is the difference between a component and a block?",
    answer: (
      <p>
        Both are reusable React components. A block handles a larger part of a
        page and composes more behavior. Signature Footer and Image Gallery
        install the same way as the smaller controls and expose typed props.
      </p>
    ),
  },
  {
    question: `Which projects does ${siteConfig.name} support?`,
    answer: (
      <p>
        {siteConfig.name} supports React 18 and 19 with Tailwind CSS 4. It works
        with Next.js, Vite, React Router, and other React setups supported by
        shadcn.
      </p>
    ),
  },
  {
    question: "Are the components accessible?",
    answer: (
      <p>
        They are built for keyboard, touch, pointer, screen readers, and reduced
        motion where applicable. Each component page explains its behavior. If
        you change that behavior, test the changed version again.
      </p>
    ),
  },
  {
    question: "How does Agent UI compare to AI Elements?",
    answer: (
      <p>
        They compose. AI Elements covers a much larger surface, including
        conversation, voice, and workflow. The {siteConfig.name} Agent UI family
        is a small set of the pieces an agent shows mid-task, installed the same
        way as everything else here. Use both in one project if that is what
        fits.
      </p>
    ),
  },
  {
    question: "Can my coding agent install components for me?",
    answer: (
      <p>
        Yes. Ask it to read{" "}
        <ExternalLink href={siteConfig.skill.url}>
          mischief-ui/skill.md
        </ExternalLink>
        , follow the instructions, and add a component by name. The same file is
        available through the standard Agent Skills discovery endpoint.
      </p>
    ),
  },
] as const

export function FaqSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-intro">
        <p className="eyebrow">Good questions</p>
        <h2 id="faq-heading">Frequently asked questions</h2>
        <p>
          The practical bits before you copy anything. Still unsure?{" "}
          <ExternalLink href={siteConfig.repository.issuesUrl}>
            Open an issue on GitHub.
          </ExternalLink>
        </p>
      </div>

      <div className="faq-list">
        {questions.map(({ question, answer }) => (
          <details className="faq-item" key={question} name="mischief-faq">
            <summary>
              <span>{question}</span>
              <Plus aria-hidden="true" size={20} strokeWidth={1.8} />
            </summary>
            <div className="faq-answer">{answer}</div>
          </details>
        ))}
      </div>
    </section>
  )
}
