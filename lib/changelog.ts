/**
 * Releases, kept here rather than read from git, because a tag message is a
 * sentence for whoever runs the release and a changelog entry is a sentence
 * for whoever is deciding whether to upgrade. Newest first.
 */
export type Release = {
  version: string
  date: string
  title: string
  summary: string
  changes: readonly string[]
  /**
   * Slugs this release added. The home page points at the newest of them, so
   * a release records what it shipped rather than a badge being hand-edited
   * and forgotten -- which is how it came to say Data Table three releases on.
   */
  components?: readonly string[]
}

export const releases: readonly Release[] = [
  {
    version: "0.8.12",
    date: "2026-08-31",
    components: ["lattice-field"],
    title: "A grid worth breaking",
    summary:
      "The scenes here all drift. Aurora Field moves a gradient, Constellation Field lets its points wander and joins the ones that stray close together, Shader Surface paints something that was never still to begin with. None of them holds a shape, so none of them can lose one. Lattice Field starts as a grid, which is the part that makes breaking it mean anything.",
    changes: [
      "Lattice Field rests as a grid of dots, parts around the pointer, and comes apart when pressed: the dots take an outward kick, fall under gravity, and pile against a floor set a little differently for each one. Pressing again lets them climb back into line.",
      "No dot stores a position. Where it lands is a function of its cell, the clock, and the few numbers the pointer contributes, so a frame is one draw call over a buffer filled once and letting go is a mix back towards the grid rather than a simulation run backwards.",
      "Each frame draws that buffer twice, the first pass with its motion turned down and in a second colour, so the grid appears to lag behind itself. It is one extra draw call and no extra state.",
      "The lattice is described by the gap between dots rather than by how many there are, so it survives a resize unchanged, and past a budget the spacing widens on its own instead of the count climbing.",
    ],
  },
  {
    version: "0.8.11",
    date: "2026-08-30",
    components: ["combobox"],
    title: "The field that was missing",
    summary:
      "Three components here each did part of a searchable multi-select and none of them did it. Model Picker opens a list and gives it keyboard control, with nothing to type into. Command Palette searches and ranks, then fires an action and closes, which is not a value you can hold. Tag Input takes free text and gives it back as chips, with no list of options behind it. Combobox is the one that combines them.",
    changes: [
      "Combobox narrows a list as you type and holds one choice or several. The multiple prop decides which, and the types narrow with it, so a single-value call site is handed a string and a multi-value one an array without either of them casting.",
      "Both modes are the same control. The field is a combobox in either, focus never leaves the input, and the active option is pointed at rather than focused, so there is one keyboard model to learn and one accessibility tree to get right. What changes is what the field holds: the chosen label, or a chip per choice.",
      "Options carry a group and appear under a heading. Same-named groups meet under one heading, and a heading disappears when nothing under it matches, so filtering never leaves an empty section behind.",
      "max caps how many can be held. At the cap the rest go unavailable rather than vanishing, which keeps the list stable and explains itself, and what is already chosen stays removable.",
      "onCreate offers what was typed as a new option. It reports the text and nothing else: the value, whether it is saved, and whether it is selected are all decisions the component has no business making.",
      "Ranking and filtering are the same contract Command Palette already used, so options that arrive from a search endpoint are not re-ranked over the server's ordering, and a half-finished fetch says it is searching instead of reporting that nothing matched.",
    ],
  },
  {
    version: "0.8.10",
    date: "2026-08-26",
    components: [
      "reviewable-diff",
      "audio-player",
      "chain-of-thought",
      "video-player",
      "web-preview",
      "subagent-tree",
      "orb",
      "transcript-viewer",
      "bar-visualizer",
      "mic-selector",
      "scrub-bar",
      "matrix",
      "response",
      "shimmering-text",
      "stopped-run",
      "memory-chips",
    ],
    title: "Sixteen more, and audio stops being a gap",
    summary:
      'Ninety-eight components and one of them touched audio: a microphone that recorded and handed back a Blob nothing here could play. Its own demo ended on "for you to send wherever it gets read". Six of the sixteen close that loop, and the rest are the surfaces an agent needs once it is doing work rather than answering: a patch reviewed a hunk at a time, the reasoning behind an answer, what several agents are doing at once, and what the thread says when a run ends early.',
    changes: [
      "Reviewable Diff stages a patch a hunk at a time. All or nothing is the wrong shape for a change somebody else wrote: the part that fixes the bug and the part that misread the codebase arrive in the same patch.",
      "Audio Player draws a recording and seeks it with a real range input laid over the drawing, because a canvas cannot be tabbed to. Peaks are a prop, so a long file need not be decoded to be drawn.",
      "Video Player is its sibling. Captions are WebVTT tracks rather than a list of lines beside the picture, so the browser draws them and the reader styles them in their own settings.",
      "Transcript Viewer and Scrub Bar are the reading half and the seeking half on their own.",
      "Chain of Thought shows the steps an assistant took, open while it works and folded away once the answer lands. The trace is deliberately kept out of a live region: reasoning arrives a token at a time and announcing it would read every half-finished revision over the top of the answer.",
      "Subagent Tree shows several agents at once, nested under whoever handed the work down. It is nested lists rather than a tree widget, because nothing in it is expanded, selected or activated, and a tree would take the arrow keys hostage for nodes nobody can operate.",
      "Stopped Run keeps what a stopped answer had already written and names it an incomplete answer, so a fragment is not read in the same voice as a finished one.",
      "Memory Chips lists what an assistant has been told to remember, in the words it was stored in, and lets one entry go without taking the rest.",
      "Web Preview frames what an agent built. It never grants allow-same-origin beside allow-scripts, which would let the framed page reach out and rewrite the sandbox holding it.",
      "Orb, Matrix, Bar Visualizer and Shimmering Text carry what an assistant is doing without words, and Response renders an answer as markdown while it is still half-written and briefly invalid. Mic Selector lists the microphones and proves the choice with a meter, without opening the device until it is asked to.",
      'Split Text broke words. Every piece is its own inline block and a browser may break between any two of them, so a narrow column read "des erve". Characters are grouped into words that cannot break internally.',
      "Conversation fades its top edge once it has been scrolled away from it. A thread following a reply to the bottom cuts its first line in half, which reads as a rendering fault rather than as there being more above.",
      "The orb was three flat discs stacked on a fourth, which is a bullseye rather than a sphere. It is lit from above and to the left now, and its glow finishes inside its box instead of being cut off square at all four edges.",
    ],
  },
  {
    version: "0.8.9",
    date: "2026-08-25",
    components: ["voice-input", "connection-beam", "json-viewer", "marquee"],
    title: "Four more, and a registry that installs",
    summary:
      "Seventeen components could not be installed at all: a dependency on a sibling was written as a bare name, which sends the CLI to shadcn's registry looking for a component only this one has. Nothing here caught it, because a dependency that resolves to the wrong place still parses. The build now installs the registry into a throwaway project and looks at what lands.",
    changes: [
      "JSON Viewer reads a payload as a keyboard-navigable tree, and every row can hand you its path in the notation you would paste back into code.",
      "Marquee runs a row seamlessly, and under reduced motion becomes an ordinary scrolling row rather than a frozen one with half its content out of reach.",
      "Voice Input draws what the microphone is hearing, which is the difference between a live one and a muted one. It records and hands back a Blob; transcription is a service, not a component.",
      "Connection Beam joins two elements with a line, measured from the elements themselves, so the diagram survives a reflow.",
      "Floating Index cancelled its own navigation: the panel closed in the same tick the scroll started, and a smooth scroll does not survive that. It now closes once the scroll has landed.",
      "Floating Index takes a position, so moving it out of the top no longer means undoing the default a utility at a time, and can say which section the reader is in.",
      "Components that animate a keyframe by name now publish it, and this site defines it too. The file thumbnail's shimmer had never run on these pages.",
      "Every component has a page for its family, and the guidelines this collection holds itself to are written down at /interfaces.",
    ],
  },
  {
    version: "0.8.8",
    date: "2026-08-24",
    components: ["data-table"],
    title: "Pointer-aware backdrops",
    summary:
      "The two field components were built to sit behind other content, and neither could ever have received a pointer event there. Both now follow the pointer on the window instead.",
    changes: [
      "Metaballs can take the pointer as another blob, merging with the rest as it passes through them.",
      "Constellation Field answers to the pointer from behind a headline that is taking every event itself.",
      "Metaballs spread their blobs to the shape of the box. A wide one used to bunch them into the middle third and merge them into a single mass.",
      "The homepage stands on a scene from the collection, and the catalogue moved to the documentation where browsing belongs.",
    ],
  },
  {
    version: "0.8.7",
    date: "2026-08-23",
    title: "Data Table",
    summary:
      "Typed rows with cells you write, column widths you set or the reader drags, sorting that is one property to switch on, and selection kept in keys rather than positions.",
    changes: [
      "Sorting in three levels: absent, the built-in comparator, or your own. A third press gives back the order the rows arrived in, and blanks stay at the bottom whichever way the column points.",
      "Widths are a colgroup over a fixed layout, so any CSS length works and columns without one share the remainder.",
      "Boundaries drag, and the handles are separators in the tab order, moved with the arrow keys.",
      "A pinned column holds against the edge while the rest scrolls, its offsets following a drag.",
      "Loading fills the body with placeholders shaped like the rows they stand in for, held back a tenth of a second so a fast answer never flashes them.",
    ],
  },
  {
    version: "0.8.6",
    date: "2026-08-22",
    title: "Scenes and Motion",
    summary:
      "Two new families, from 65 components to 93. Scenes is for components where the drawing is the job; Motion is for entrances and numbers that move.",
    changes: [
      "Everything drawn sits on one shared surface, which sleeps off screen, recovers a lost GPU context, and paints one still frame instead of a loop when motion is reduced.",
      "Shaders resolve theme custom properties into their own colours, so the same surface arrives dark in a dark application and light in a light one.",
      "Two components ask for three, both as optional peers. The package root does not export them, so nothing else pays for it.",
      "Fixes a fault where sleeping rebuilt the canvas, wiping a surface that had painted once by the very act of stopping.",
    ],
  },
]

/** The newest component this project has actually released. */
export function newestComponent() {
  for (const release of releases) {
    const slug = release.components?.[0]
    if (slug) return { slug, version: release.version }
  }

  return undefined
}
