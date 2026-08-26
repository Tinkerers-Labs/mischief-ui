/**
 * What agent experience is, written down because most of what is published
 * about it is a position rather than an explanation.
 */
export type AxTable = {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}

export type AxSection = {
  id: string
  title: string
  body: readonly string[]
  table?: AxTable
  /** Files on this site a reader can open to see the thing itself. */
  seen?: readonly { label: string; href: string }[]
}

export const axIntro =
  "Software gets used by agents now, and they are a strange kind of user: they read everything literally, ask nobody, and give up quietly. This is what that changes, what the tooling for it actually is, and what nobody has worked out yet."

export const axSections: readonly AxSection[] = [
  {
    id: "what-it-is",
    title: "What it is",
    body: [
      "An agent reads your documentation, runs your install command, and either gets where it was going or does not. Nobody is watching while it happens. Agent experience is the name for how that goes.",
      "The useful comparison is developer experience. A developer who hits a confusing error reads around it, asks someone, works it out. An agent hits the same error and invents an answer or stops. Same error, and only one of those ends with somebody learning something.",
      "So it is not a rebrand of DX. It is the part of DX that stops working when nobody is watching.",
    ],
  },
  {
    id: "why-now",
    title: "Why now",
    body: [
      "More than a thousand sites a day get built on Netlify by people who never open the dashboard. They asked a chatbot, and it worked, because no step in the path happened to need a person.",
      "Nothing about that was designed. It just turned out that a service you can get all the way through without a human is a service an agent can finish a job on. Everything else here follows from that.",
    ],
  },
  {
    id: "principles",
    title: "The principles",
    body: [
      "There are five written down. Three are worth your time.",
      "The sharp one is that no step should need a human. Taken seriously, that removes the signup wall in front of your documentation and the API key that arrives by email. The second is to stop writing for a reader who has already read the rest of your documentation, which is easy to agree with and hard to actually do.",
      "The third is to log agent traffic separately. Almost nobody does, which is why almost nobody can tell you whether any of this worked. The remaining two are hard to fail.",
    ],
    table: {
      headers: ["Principle", "What it asks for"],
      rows: [
        [
          "Human centricity",
          "An agent is a delegate. Design for whoever sent it.",
        ],
        ["Agent accessibility", "No step in the path may require a human."],
        ["Contextual alignment", "Assume the model knows nothing about you."],
        ["Interactivity patterns", "Conventions for citation and provenance."],
        [
          "Differentiate agents",
          "Your logs should record that an agent did it.",
        ],
      ],
    },
  },
  {
    id: "mechanisms",
    title: "The four things it is made of",
    body: [
      "Four different things get talked about as though they were one decision. They are not interchangeable, and choosing by fashion is how you end up maintaining three files nobody reads.",
    ],
    table: {
      headers: ["", "What it is", "Who reads it", "Reach for it when"],
      rows: [
        [
          "llms.txt",
          "A markdown index of your documentation at a fixed path.",
          "Any model pointed at your site.",
          "Your docs are worth reading and your HTML is not the way to read them.",
        ],
        [
          "AGENTS.md",
          "Instructions living in a repository, about that repository.",
          "A coding agent in the checkout.",
          "Something is going to change your code and needs the house rules.",
        ],
        [
          "Agent Skills",
          "A named procedure, loaded when its description matches the task.",
          "An agent deciding what it knows how to do.",
          "There is a right way to use your thing and it does not fit in a README.",
        ],
        [
          "MCP",
          "A protocol exposing tools an agent can call, over a live connection.",
          "An agent that needs to act, not read.",
          "Reading is not enough.",
        ],
      ],
    },
  },
  {
    id: "measuring",
    title: "Measuring it",
    body: [
      "One tool gives you a number. You write a scenario as a prompt and a rubric, it runs against a real agent, and something judges what happened. Lighthouse, roughly.",
      "A fifth of the score is the agent's own planning. That is honest of them, and it means the number moves when the model does. What you get is a reading, not a property of your software.",
    ],
    table: {
      headers: ["Dimension", "Weight", "What it looks at"],
      rows: [
        ["Goal achievement", "40%", "Did the task get done."],
        ["Environment", "20%", "Shell, filesystem, build tooling."],
        ["Service", "20%", "APIs, MCP tools, third parties."],
        ["Agent", "20%", "The agent's own planning and tool choice."],
      ],
    },
  },
  {
    id: "unsettled",
    title: "What is not settled",
    body: [
      "Nobody has written the spec, and the people who coined the term say so themselves. No file format, no endpoint shape, no auth pattern. Just the observation that this matters, which it does.",
      "What you actually have is a vocabulary, four mechanisms at different stages of being real, and one way to take a measurement. Anyone handing you an AX checklist wrote it themselves.",
      "Take what solves a problem you already have. Measure whether it helped. Wait on the rest.",
    ],
  },
  {
    id: "here",
    title: "The four, in one place",
    body: [
      "Three of the four are here, which makes this an easy place to see what they look like rather than what they are described as. MCP is not: the shadcn CLI already hands registries to agents over its own, and a second one nobody calls is just something else to keep working.",
      "These are the files themselves, not descriptions of them. Open two and the difference explains itself.",
    ],
    seen: [
      { label: "llms.txt", href: "/llms.txt" },
      { label: "llms-full.txt", href: "/llms-full.txt" },
      { label: "skill.md", href: "/skill.md" },
      { label: "skill-reference.md", href: "/skill-reference.md" },
      {
        label: "agent-skills discovery",
        href: "/.well-known/agent-skills/index.json",
      },
    ],
  },
]
