/**
 * What agent experience is, written down because most of what is published
 * about it is a position rather than an explanation.
 *
 * Every claim about somebody else's work carries the page it came from. The
 * sections about this site name what a reader can open to check it.
 */
export type AxSource = {
  label: string
  href: string
}

export type AxTable = {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}

export type AxSection = {
  id: string
  title: string
  body: readonly string[]
  table?: AxTable
  /** Pages on this site that show the section is true here. */
  seen?: readonly AxSource[]
  sources?: readonly AxSource[]
}

export const axIntro =
  "Agent experience is what a piece of software is like to use when the thing using it is an agent rather than a person. The term is a year old, the field has more manifesto than method, and the parts of it that are settled are worth knowing. This is what it means, what it is made of, and what nobody has worked out yet."

export const axSections: readonly AxSection[] = [
  {
    id: "what-it-is",
    title: "What it is",
    body: [
      "Agent experience, or AX, is the holistic experience an agent has when it uses a product. Mathias Biilmann of Netlify named it in 2025, and the definition has stayed close to that: how well an agent can find out what your service does, call it without guessing, and recover when something goes wrong.",
      "It is usually explained against developer experience, and the distinction is worth keeping. DX is about the person building on your platform. AX is about the agent that person sends in their place. The two come apart in a specific way: a developer who hits an unclear error reads around it, asks somebody, and works it out. An agent hits the same error and either invents an answer or gives up, and in both cases the person who delegated the work is not there to see it happen.",
      "So AX is not a rebrand of DX. It is the part of DX that stops working when nobody is watching.",
    ],
    sources: [
      { label: "agentexperience.ax", href: "https://agentexperience.ax/" },
      {
        label: "Netlify on agent experience",
        href: "https://www.netlify.com/agent-experience/",
      },
    ],
  },
  {
    id: "why-now",
    title: "Why it turned up when it did",
    body: [
      "Netlify noticed that more than a thousand sites a day were being created on their platform straight out of ChatGPT. Nobody had designed for that. It worked because a deploy happened to be reachable without a human in the loop, and it would have failed if any step had needed a person to click something.",
      "That is the whole argument, and it does not need the forecasting that usually comes with it. A class of user arrived that reads documentation literally, never asks a colleague, and abandons a task rather than filing a bug. Everything else follows from taking that user seriously.",
    ],
    sources: [
      {
        label: "Beyond DX, The New Stack",
        href: "https://thenewstack.io/beyond-dx-developers-must-now-learn-agent-experience-ax/",
      },
    ],
  },
  {
    id: "principles",
    title: "The principles, and which of them bite",
    body: [
      "The canonical list has five principles for services and five for agents. Three of the five for services carry real weight, and the summaries below are ours rather than theirs.",
      "Agent accessibility is the sharp one. Its own wording is that requiring a human in order to reach a goal is an anti-pattern. Read plainly, that rules out a great deal of ordinary practice: a signup wall in front of the documentation, an API key that arrives by email, a dashboard that is the only way to do something the API almost supports.",
      "Contextual alignment says a service cannot assume the model already knows it. That sounds obvious and is routinely broken by documentation written for somebody who has already read the rest of the documentation.",
      "Differentiating agent interaction is the one nobody does. If your logs cannot tell an agent from a person, you have no idea which half of your interface is being used, and no way to tell whether any of this worked.",
      "The remaining two, human centricity and interactivity patterns, are closer to statements of intent. They are not wrong. They are just hard to fail.",
    ],
    table: {
      headers: ["Principle", "What it asks for"],
      rows: [
        [
          "Human centricity",
          "An agent is a delegate. Design for the person who sent it.",
        ],
        [
          "Agent accessibility",
          "No step in the path may require a human. Parity with the human interface.",
        ],
        [
          "Contextual alignment",
          "Supply the context. Assume the model knows nothing about you.",
        ],
        [
          "Interactivity patterns",
          "Conventions for citation, provenance, and anything consequential.",
        ],
        [
          "Differentiate agent interaction",
          "Your metrics and logs should record that an agent did it.",
        ],
      ],
    },
    sources: [
      {
        label: "Principles of AX",
        href: "https://agentexperience.ax/concepts/principles-of-ax/",
      },
    ],
  },
  {
    id: "mechanisms",
    title: "The four things it is actually made of",
    body: [
      "AX as a word covers four separate mechanisms that get discussed together and are not interchangeable. This is the part that is hard to find written down, and the part worth knowing before adopting any of it.",
      "The short version: llms.txt is for a model reading your site, AGENTS.md is for a coding agent working in your repository, a skill is a procedure an agent loads when it is relevant, and MCP is a live connection to something that can act. A project can want all four or one of them, and choosing by fashion is how you end up maintaining three files nobody reads.",
    ],
    table: {
      headers: ["", "What it is", "Who reads it", "Reach for it when"],
      rows: [
        [
          "llms.txt",
          "A markdown index of your documentation at a fixed path, with the full text alongside it.",
          "Any model that has been pointed at your site.",
          "Your documentation is worth reading and your HTML is not the best way to read it.",
        ],
        [
          "AGENTS.md",
          "Instructions that live in a repository, about that repository.",
          "A coding agent working in the checkout.",
          "Somebody, or something, is going to change your code and needs the house rules.",
        ],
        [
          "Agent Skills",
          "A named procedure with a description, loaded when the description matches the task.",
          "An agent deciding what it knows how to do.",
          "There is a right way to use your thing and it does not fit in a README.",
        ],
        [
          "MCP",
          "A protocol for exposing tools an agent can call, over a live connection.",
          "An agent that needs to do something, not read something.",
          "Reading is not enough and the agent has to act.",
        ],
      ],
    },
    sources: [
      {
        label: "AX concepts",
        href: "https://agentexperience.ax/concepts/",
      },
      { label: "AGENTS.md", href: "https://agents.md/" },
      { label: "llms.txt", href: "https://llmstxt.org/" },
      {
        label: "Model Context Protocol",
        href: "https://modelcontextprotocol.io/",
      },
    ],
  },
  {
    id: "measuring",
    title: "Measuring it",
    body: [
      "AXIS is the one part of this that produces a number. Netlify built it, it is open source, and the comparison it invites is Lighthouse: you write a scenario as a prompt and a rubric, it runs the scenario against a real agent, and an LLM judge scores what happened.",
      "It weights four dimensions. Goal achievement is forty per cent, and the other three take twenty each: the environment, meaning whether your project structure and build tooling got in the way; the service, meaning whether your endpoints and tools were usable; and the agent itself, meaning the quality of its own planning and tool choice.",
      "That last dimension is the interesting one, because it is not about you. A fifth of the score is the agent's own competence, which is an honest admission that these results move when the model does. A score is a reading taken with one agent on one day, not a property of your software.",
    ],
    table: {
      headers: ["Dimension", "Weight", "What it looks at"],
      rows: [
        ["Goal achievement", "40%", "Did the task actually get done."],
        ["Environment", "20%", "Shell, filesystem, and build tooling."],
        ["Service", "20%", "APIs, MCP tools, and third parties."],
        ["Agent", "20%", "The agent's own planning and tool selection."],
      ],
    },
    sources: [{ label: "AXIS", href: "https://axis.run/" }],
  },
  {
    id: "unsettled",
    title: "What is not settled",
    body: [
      "The canonical concepts page says, in its own words, that concrete best practices are still being identified. Netlify's page prescribes no file formats, no endpoint shapes, and no authentication patterns. That is worth saying plainly, because a field with a name, a conference talk, and a scoring tool can look more settled than it is.",
      "What exists today is a vocabulary, four mechanisms at different stages of standardisation, and one way to take a measurement. What does not exist is a specification you can conform to. Anyone offering you an AX checklist is writing it themselves.",
      "The reasonable position is to adopt the mechanisms that solve a problem you actually have, measure whether they worked, and wait on the rest. Most of the cost of being early here is maintaining files nobody reads.",
    ],
    sources: [
      {
        label: "Applying AX practices",
        href: "https://agentexperience.ax/concepts/applying-ax-practices/",
      },
    ],
  },
  {
    id: "here",
    title: "The four, in one place",
    body: [
      "Three of the four mechanisms are in use on this site, which makes it a convenient place to see what each one actually looks like rather than what it is described as. The fourth, MCP, is not here: the shadcn CLI already exposes registries to agents over its own MCP server, and a second one for a hundred and fourteen components nobody has to call would be a file nobody reads.",
      "The links below return exactly what an agent gets. Opening one in a browser is the fastest way to understand the difference between an index, a full text, and a skill.",
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
