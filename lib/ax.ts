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
  "Agents are a strange kind of user. They read everything literally, ask nobody, and give up quietly. Designing for that has a name now, about four moving parts worth knowing, and a good deal nobody has worked out yet."

export const axSections: readonly AxSection[] = [
  {
    id: "what-it-is",
    title: "What it is",
    body: [
      "An agent reads your documentation, runs your install command, and either gets where it was going or it does not. Agent experience is the name for how that goes.",
      "Developer experience is the useful comparison. A developer who hits a confusing error reads around it, asks someone, works it out. An agent hits the same error and invents an answer or stops. Same error, and only one of them ends with anybody learning anything.",
      "So it is not a rebrand of DX. It is the part of DX that stops working when nobody is watching.",
    ],
  },
  {
    id: "why-now",
    title: "Why now",
    body: [
      "More than a thousand sites a day get built on Netlify by people who never open the dashboard. They asked a chatbot, and it worked, because no step in the path happened to need a person.",
      "Nobody designed for that. It fell out of the service being finishable end to end, which sounds like a low bar until you check how much software clears it.",
    ],
  },
  {
    id: "principles",
    title: "The principles",
    body: [
      "Five are written down. Three of them bite.",
      "Agent accessibility is the sharp one, and it is the whole of the argument: no step in the path may require a human. Taken seriously that removes the signup wall in front of your documentation and the API key that arrives by email.",
      "Contextual alignment means writing for somebody who has not read the rest of your documentation, which everyone agrees with and few manage. Differentiating agents means logging their traffic apart from everyone else's, which is rarer still, and is why so few people can tell you whether any of this helped. The other two are hard to fail.",
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
      "Most projects want one or two of them. The last column is the one to read first.",
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
      "AXIS is the one tool that gives you a number, and it works the way Lighthouse does. You write a scenario as a prompt and a rubric, it runs against a real agent, and a model judges what came back.",
      "A fifth of the score is the agent's own planning rather than anything you built, which is an honest thing to have admitted, and means the number moves when the model does. What you get is a reading, not a property of your software.",
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
      "Nobody has written the spec, and the people who coined the term say so themselves. No file format, no endpoint shape, no auth pattern.",
      "What you actually have is a vocabulary, four mechanisms at different stages of being real, and one way to take a measurement. Anyone handing you an AX checklist wrote it themselves.",
      "Take what solves a problem you already have. Measure whether it helped. Wait on the rest.",
    ],
  },
  {
    id: "here",
    title: "The four, in one place",
    body: [
      "Three of the four are in use on this site, which makes it an easier place to see them than to read about them. MCP is not: the shadcn CLI already hands registries to agents over its own, and a second one nobody calls is just something else to keep working.",
      "These are the files, not descriptions of them. Open two and the difference explains itself.",
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
